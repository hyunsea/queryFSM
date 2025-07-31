import React, { useState } from 'react';
import { X, Search, Plus, ArrowLeft, Loader2 } from 'lucide-react';

interface ProcessIdCandidate {
  process_id: string;
  total_count: number;
}

interface AddPartIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

type ModalStep = 'input' | 'candidates' | 'loading';

const AddPartIdModal: React.FC<AddPartIdModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [step, setStep] = useState<ModalStep>('input');
  const [partId, setPartId] = useState('');
  const [candidates, setCandidates] = useState<ProcessIdCandidate[]>([]);
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const resetModal = () => {
    setStep('input');
    setPartId('');
    setCandidates([]);
    setSelectedProcessId('');
    setIsSearching(false);
    setIsRegistering(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSearch = async () => {
    if (!partId.trim()) return;

    setIsSearching(true);
    try {
      // Mock API call - replace with actual endpoint
      const response = await fetch(`/get_processid?part_id=${encodeURIComponent(partId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search for candidates');
      }

      const candidatesData: ProcessIdCandidate[] = await response.json();
      setCandidates(candidatesData);
      setStep('candidates');
    } catch (error) {
      // Mock data for demonstration
      const mockCandidates: ProcessIdCandidate[] = [
        { process_id: `candidate_${partId}_01`, total_count: 450 },
        { process_id: `candidate_${partId}_02`, total_count: 120 },
        { process_id: `candidate_${partId}_03`, total_count: 89 }
      ];
      setCandidates(mockCandidates);
      setStep('candidates');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedProcessId) return;

    setIsRegistering(true);
    try {
      const response = await fetch('/add_valid_product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          part_id: partId,
          process_id: selectedProcessId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register Part ID');
      }

      handleClose();
      onSuccess();
    } catch (error) {
      onError('Failed to register Part ID. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBackToInput = () => {
    setStep('input');
    setCandidates([]);
    setSelectedProcessId('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step === 'input' && partId.trim() && !isSearching) {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Add New Part ID</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'input' && (
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

          {step === 'candidates' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handleBackToInput}
                  className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600">
                  Found {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} for "{partId}"
                </span>
              </div>

              {candidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p>No candidates found for this Part ID.</p>
                  <p className="text-sm mt-1">Try a different search term.</p>
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {candidates.map((candidate) => (
                      <label
                        key={candidate.process_id}
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
                          <div className="font-mono text-sm font-medium text-gray-900">
                            {candidate.process_id}
                          </div>
                          <div className="text-xs text-gray-500">
                            Total count: {candidate.total_count.toLocaleString()}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPartIdModal;