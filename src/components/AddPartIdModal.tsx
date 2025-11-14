import React, { useState } from 'react';
import { X, Search, Plus, Loader2 } from 'lucide-react';
import { getProcessIdCandidates, registerNewProcessId } from '../utils/mockApi';

interface ProcessIdCandidate {
  process_id: string;
  total_count: number;
}

interface AddPartIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
  initialPartId?: string;
}

type ModalStep = 'input' | 'candidates' | 'loading';

const AddPartIdModal: React.FC<AddPartIdModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialPartId
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('input');
  const [partId, setPartId] = useState('');
  const [candidates, setCandidates] = useState<ProcessIdCandidate[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const resetModal = () => {
    setCurrentStep('input');
    setPartId('');
    setCandidates([]);
    setSelectedProcessId('');
    setIsSearching(false);
    setIsRegistering(false);
  };

  // Auto-populate partId and trigger search when initialPartId is provided
  React.useEffect(() => {
    if (isOpen && initialPartId && initialPartId !== partId) {
      setPartId(initialPartId);
      // Auto-trigger search
      (async () => {
        setIsSearching(true);
        try {
          const fetchedCandidates = await getProcessIdCandidates(initialPartId);
          setCandidates(fetchedCandidates);
          setCurrentStep('candidates');
        } catch (error) {
          onError('Failed to fetch candidates. Please try again.');
        } finally {
          setIsSearching(false);
        }
      })();
    }
  }, [isOpen, initialPartId]);

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSearch = async () => {
    if (!partId.trim()) return;

    setIsSearching(true);
    try {
      const fetchedCandidates = await getProcessIdCandidates(partId);
      setCandidates(fetchedCandidates);
      setCurrentStep('candidates');
    } catch (error) {
      onError('Failed to fetch candidates. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedProcessId) return;

    setIsRegistering(true);
    try {
      await registerNewProcessId({
        part_id: partId,
        process_id: selectedProcessId
      });
      handleClose();
      onSuccess();
    } catch (error: any) {
      onError(error.message || 'Failed to register Part ID. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep === 'input' && partId.trim() && !isSearching) {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Add New Part ID</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part ID
                </label>
                <input
                  type="text"
                  value={partId}
                  onChange={(e) => setPartId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Part ID to search..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={!partId.trim() || isSearching}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          )}

          {currentStep === 'candidates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">Select Process ID</h3>
                <button
                  onClick={() => setCurrentStep('input')}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  ← Back
                </button>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                Found {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} for "{partId}"
              </div>

              {candidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No candidates found for this Part ID.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {candidates.map((candidate, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <input
                        type="radio"
                        name="processId"
                        value={candidate.process_id}
                        checked={selectedProcessId === candidate.process_id}
                        onChange={(e) => setSelectedProcessId(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-mono text-sm text-gray-900">
                          {candidate.process_id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total count: {candidate.total_count.toLocaleString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                onClick={handleRegister}
                disabled={!selectedProcessId || isRegistering}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isRegistering ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPartIdModal;