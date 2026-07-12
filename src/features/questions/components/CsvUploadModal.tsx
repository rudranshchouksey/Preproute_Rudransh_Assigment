import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, Download } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { cn } from '../../../lib/utils';
import type { QuestionDraft } from '../types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: QuestionDraft[]) => void;
  existingCount: number;
  maxQuestions: number;
}

interface CsvRow {
  [key: string]: string;
}

interface ParsedQuestion {
  question: QuestionDraft;
  rowIndex: number;
  errors: string[];
  isValid: boolean;
}

interface ColumnMapping {
  stem: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  difficulty: string;
  explanation: string;
  topic: string;
  subTopic: string;
  mediaUrl: string;
}

const DEFAULT_MAPPING: ColumnMapping = {
  stem: 'question',
  optionA: 'option_a',
  optionB: 'option_b',
  optionC: 'option_c',
  optionD: 'option_d',
  correctAnswer: 'correct_answer',
  difficulty: 'difficulty',
  explanation: 'explanation',
  topic: 'topic',
  subTopic: 'sub_topic',
  mediaUrl: 'media_url',
};

const MAPPING_LABELS: Record<keyof ColumnMapping, { label: string; required: boolean }> = {
  stem: { label: 'Question Text', required: true },
  optionA: { label: 'Option A', required: true },
  optionB: { label: 'Option B', required: true },
  optionC: { label: 'Option C', required: true },
  optionD: { label: 'Option D', required: true },
  correctAnswer: { label: 'Correct Answer (A/B/C/D or 1/2/3/4)', required: true },
  difficulty: { label: 'Difficulty', required: false },
  explanation: { label: 'Explanation', required: false },
  topic: { label: 'Topic', required: false },
  subTopic: { label: 'Sub Topic', required: false },
  mediaUrl: { label: 'Image URL', required: false },
};

function parseCSV(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  // Simple CSV parsing that handles quoted fields
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

function normalizeCorrectAnswer(value: string): string | null {
  const v = value.trim().toUpperCase();
  const map: Record<string, string> = {
    'A': '1', '1': '1',
    'B': '2', '2': '2',
    'C': '3', '3': '3',
    'D': '4', '4': '4',
  };
  return map[v] || null;
}

function mapRowToQuestion(row: CsvRow, mapping: ColumnMapping, rowIndex: number): ParsedQuestion {
  const errors: string[] = [];

  const stem = row[mapping.stem] || '';
  const optA = row[mapping.optionA] || '';
  const optB = row[mapping.optionB] || '';
  const optC = row[mapping.optionC] || '';
  const optD = row[mapping.optionD] || '';
  const correctRaw = row[mapping.correctAnswer] || '';
  const difficulty = row[mapping.difficulty] || '';
  const explanation = row[mapping.explanation] || '';
  const topic = row[mapping.topic] || '';
  const subTopic = row[mapping.subTopic] || '';
  const mediaUrl = row[mapping.mediaUrl] || '';

  if (!stem) errors.push('Question text is empty');
  if (!optA) errors.push('Option A is empty');
  if (!optB) errors.push('Option B is empty');
  if (!optC) errors.push('Option C is empty');
  if (!optD) errors.push('Option D is empty');

  const correctOptionId = normalizeCorrectAnswer(correctRaw);
  if (!correctOptionId) errors.push(`Invalid correct answer: "${correctRaw}" (expected A/B/C/D or 1/2/3/4)`);

  return {
    question: {
      stem,
      options: [
        { id: '1', text: optA },
        { id: '2', text: optB },
        { id: '3', text: optC },
        { id: '4', text: optD },
      ],
      correctOptionId: correctOptionId || '1',
      difficulty: difficulty.toLowerCase(),
      explanation,
      topicId: topic,
      subTopicId: subTopic,
      mediaUrl: mediaUrl,
    },
    rowIndex: rowIndex + 2, // +2 for 1-indexed + header row
    errors,
    isValid: errors.length === 0,
  };
}

export const CsvUploadModal = ({ isOpen, onClose, onImport, existingCount, maxQuestions }: CsvUploadModalProps) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping(DEFAULT_MAPPING);
    setParsedQuestions([]);
    setShowErrors(false);
    setIsImporting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      if (headers.length === 0 || rows.length === 0) {
        alert('CSV file is empty or has no data rows.');
        return;
      }

      setCsvHeaders(headers);
      setCsvRows(rows);

      // Auto-map columns if headers match common names
      const autoMapping = { ...DEFAULT_MAPPING };
      const commonMaps: Record<keyof ColumnMapping, string[]> = {
        stem: ['question', 'question_text', 'stem', 'q', 'text'],
        optionA: ['option_a', 'a', 'opt_a', 'option1', 'opt1'],
        optionB: ['option_b', 'b', 'opt_b', 'option2', 'opt2'],
        optionC: ['option_c', 'c', 'opt_c', 'option3', 'opt3'],
        optionD: ['option_d', 'd', 'opt_d', 'option4', 'opt4'],
        correctAnswer: ['correct_answer', 'answer', 'correct', 'correct_option', 'ans'],
        difficulty: ['difficulty', 'level', 'diff'],
        explanation: ['explanation', 'explain', 'solution', 'rationale'],
        topic: ['topic', 'chapter', 'unit'],
        subTopic: ['sub_topic', 'subtopic', 'sub_chapter', 'section'],
        mediaUrl: ['media_url', 'image', 'image_url', 'media'],
      };

      for (const [field, aliases] of Object.entries(commonMaps)) {
        const match = headers.find(h => aliases.includes(h));
        if (match) {
          autoMapping[field as keyof ColumnMapping] = match;
        }
      }

      setMapping(autoMapping);
      setStep('mapping');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleProceedToPreview = () => {
    const parsed = csvRows.map((row, idx) => mapRowToQuestion(row, mapping, idx));
    setParsedQuestions(parsed);
    setStep('preview');
  };

  const handleImport = () => {
    setIsImporting(true);
    const validQuestions = parsedQuestions.filter(p => p.isValid).map(p => p.question);
    
    // Simulate a brief processing delay for UX
    setTimeout(() => {
      onImport(validQuestions);
      setIsImporting(false);
      handleClose();
    }, 500);
  };

  if (!isOpen) return null;

  const validCount = parsedQuestions.filter(p => p.isValid).length;
  const invalidCount = parsedQuestions.filter(p => !p.isValid).length;
  const availableSlots = maxQuestions - existingCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
              <FileSpreadsheet size={20} className="text-brand" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import Questions from CSV</h2>
              <p className="text-sm text-gray-500">
                {step === 'upload' && 'Upload your CSV file'}
                {step === 'mapping' && 'Map CSV columns to question fields'}
                {step === 'preview' && `${validCount} of ${parsedQuestions.length} questions ready to import`}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-2">
            {['Upload', 'Map Columns', 'Preview & Import'].map((label, idx) => {
              const stepNames = ['upload', 'mapping', 'preview'] as const;
              const currentIdx = stepNames.indexOf(step);
              const isActive = idx === currentIdx;
              const isComplete = idx < currentIdx;
              return (
                <div key={label} className="flex items-center gap-2">
                  {idx > 0 && <div className={cn("w-8 h-px", isComplete ? "bg-brand" : "bg-gray-300")} />}
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    isActive ? "bg-brand text-white" : isComplete ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-500"
                  )}>
                    {isComplete ? <CheckCircle2 size={12} /> : <span>{idx + 1}</span>}
                    <span>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                  isDragOver ? "border-brand bg-brand/5 scale-[1.01]" : "border-gray-300 hover:border-brand/50 hover:bg-gray-50"
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                    isDragOver ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-400"
                  )}>
                    <Upload size={24} />
                  </div>
                  <div>
                    <p className="text-base font-medium text-gray-700">
                      {isDragOver ? 'Drop your CSV file here' : 'Click to browse or drag & drop'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">.csv files only</p>
                  </div>
                </div>
              </div>

              {/* CSV Format Guide */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Expected CSV Format</h4>
                  <Button variant="outline" size="sm" onClick={() => {
                    const sample = 'question,option_a,option_b,option_c,option_d,correct_answer,difficulty,explanation,media_url\n"Which of the following is NOT a fundamental state of matter?","Solid","Liquid","Gas","Energy","D","easy","Energy is a property of objects, not a state of matter like solid, liquid, gas, or plasma.",""\n"What is the chemical symbol for Gold?","Au","Ag","Fe","Gd","A","easy","Au comes from the Latin word aurum, meaning gold.",""\n"Identify the organelle known as the powerhouse of the cell.","Nucleus","Mitochondria","Ribosome","Endoplasmic Reticulum","B","medium","Mitochondria generate most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.",""';
                    const blob = new Blob([sample], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sample_questions.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}>
                    <Download size={14} className="mr-1.5" /> Download Sample
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'difficulty', 'explanation', 'media_url'].map(h => (
                          <th key={h} className="border border-gray-200 px-2 py-1.5 text-left font-semibold text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Which of the following is NOT...</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Solid</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Liquid</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Gas</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Energy</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">D</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">easy</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500">Energy is a property...</td>
                        <td className="border border-gray-200 px-2 py-1.5 text-gray-500"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-700 text-sm p-4 rounded-lg border border-blue-100 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Found <strong>{csvHeaders.length} columns</strong> and <strong>{csvRows.length} rows</strong> in your CSV. Map each column to the correct question field below.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.keys(MAPPING_LABELS) as (keyof ColumnMapping)[]).map((field) => {
                  const { label, required } = MAPPING_LABELS[field];
                  return (
                    <div key={field} className="space-y-1">
                      <label className="text-xs font-medium text-gray-600">
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      <select
                        value={mapping[field]}
                        onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                        className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                      >
                        <option value="">— Skip —</option>
                        {csvHeaders.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Stats Bar */}
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="success" className="text-sm px-3 py-1">
                  <CheckCircle2 size={14} className="mr-1" /> {validCount} Valid
                </Badge>
                {invalidCount > 0 && (
                  <Badge variant="danger" className="text-sm px-3 py-1">
                    <AlertCircle size={14} className="mr-1" /> {invalidCount} Errors
                  </Badge>
                )}
                {validCount > availableSlots && (
                  <Badge variant="warning" className="text-sm px-3 py-1">
                    Only {availableSlots} slots available — {validCount - availableSlots} will be trimmed
                  </Badge>
                )}
              </div>

              {/* Error Rows Toggle */}
              {invalidCount > 0 && (
                <button 
                  onClick={() => setShowErrors(!showErrors)}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {showErrors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {showErrors ? 'Hide' : 'Show'} error details ({invalidCount} rows)
                </button>
              )}

              {showErrors && invalidCount > 0 && (
                <Card className="!p-0 border-red-200 max-h-48 overflow-y-auto">
                  <div className="divide-y divide-red-100">
                    {parsedQuestions.filter(p => !p.isValid).map((p) => (
                      <div key={p.rowIndex} className="px-4 py-3 text-sm">
                        <span className="font-semibold text-red-700">Row {p.rowIndex}:</span>
                        <span className="text-red-600 ml-2">{p.errors.join('; ')}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Preview Table */}
              <Card className="!p-0 overflow-hidden">
                <div className="max-h-[40vh] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 w-10">#</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600">Question</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 w-16">Ans</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedQuestions.map((p, idx) => (
                        <tr key={idx} className={cn(p.isValid ? "hover:bg-gray-50" : "bg-red-50/50")}>
                          <td className="px-3 py-2 text-gray-400 font-medium">{idx + 1}</td>
                          <td className="px-3 py-2 text-gray-900 truncate max-w-[300px]" title={p.question.stem}>
                            {p.question.stem || <span className="text-gray-400 italic">Empty</span>}
                          </td>
                          <td className="px-3 py-2 text-gray-600 font-mono">
                            {String.fromCharCode(64 + parseInt(p.question.correctOptionId))}
                          </td>
                          <td className="px-3 py-2">
                            {p.isValid ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : (
                              <AlertCircle size={16} className="text-red-500" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Import Progress (during import) */}
              {isImporting && (
                <div className="flex items-center gap-3 p-4 bg-brand/5 rounded-lg border border-brand/20">
                  <Loader2 className="animate-spin text-brand" size={20} />
                  <p className="text-sm font-medium text-brand">Importing {Math.min(validCount, availableSlots)} questions...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <Button variant="ghost" onClick={step === 'upload' ? handleClose : () => setStep(step === 'preview' ? 'mapping' : 'upload')}>
            {step === 'upload' ? 'Cancel' : 'Back'}
          </Button>
          <div className="flex items-center gap-3">
            {step === 'mapping' && (
              <Button onClick={handleProceedToPreview}>
                Preview Questions
              </Button>
            )}
            {step === 'preview' && (
              <Button 
                onClick={handleImport} 
                isLoading={isImporting}
                disabled={validCount === 0}
              >
                Import {Math.min(validCount, availableSlots)} Questions
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
