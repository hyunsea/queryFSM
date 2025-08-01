import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Search, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockApi, ValidProduct, FilelistResponse, SubmitQueryRequest, QueryJob } from '../utils/mockApi';
import PartIdSelector from './ProcessIdSelector';
import AddPartIdModal from './AddPartIdModal';

interface SidebarProps {
  onNewQuery: (job: QueryJob) => void;
  onSubmitSuccess: () => void;
  onSubmitError: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewQuery, onSubmitSuccess, onSubmitError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [validProducts, setValidProducts] = useState<ValidProduct[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string>('');

  // Add Part ID Modal state
  const [isAddPartIdModalOpen, setIsAddPartIdModalOpen] = useState(false);

  useEffect(() => {
    const loadValidProducts = async () => {
      try {
        const products = await mockApi.getValidProducts();
        setValidProducts(products);
      } catch (error) {
        console.error('Failed to load valid products:', error);
      }
    };
    loadValidProducts();
  }, []);

  useEffect(() => {
    const loadFilelist = async () => {
      if (selectedPartId) {
        try {
          const filelist = await mockApi.getFilelist(selectedPartId);
          setAvailableDates(filelist.filelist);
        } catch (error) {
          console.error('Failed to load filelist:', error);
          setAvailableDates([]);
        }
      } else {
        setAvailableDates([]);
      }
    };
    loadFilelist();
  }, [selectedPartId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || !startDate || !endDate) return;

    setIsSubmitting(true);
    try {
      const request: SubmitQueryRequest = {
        part_id: selectedPartId,
        start_date: startDate,
        end_date: endDate
      };
      const newJob = await mockApi.submitQuery(request);
      onNewQuery(newJob);
      onSubmitSuccess();
      
      // Reset form
      handleClearSelection();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to submit query:', error);
      onSubmitError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedPartId('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setAvailableDates([]);
  };

  const handleAddPartIdSuccess = async () => {
    onSubmitSuccess();
    // Refresh the valid products list
    try {
      const products = await mockApi.getValidProducts();
      setValidProducts(products);
    } catch (error) {
      console.error('Failed to refresh valid products:', error);
    }
  };

  const handleAddPartIdError = (message: string) => {
    onSubmitError();
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isAvailable = !availableDates.includes(dateStr); // Invert: dates NOT in filelist are available
      const isToday = current.toDateString() === today.toDateString();
      
      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth,
        isAvailable,
        isToday,
        day: current.getDate()
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const handleDateClick = (dateStr: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    
    if (!startDate || (startDate && endDate)) {
      // Starting a new selection
      setStartDate(dateStr);
      setEndDate('');
    } else if (startDate && !endDate) {
      // Completing the selection
      if (dateStr >= startDate) {
        setEndDate(dateStr);
      } else {
        // If clicked date is before start date, make it the new start date
        setStartDate(dateStr);
        setEndDate('');
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateHover = (dateStr: string) => {
    if (startDate && !endDate) {
      setHoveredDate(dateStr);
    }
  };

  const isDateInPreviewRange = (dateStr: string) => {
    if (!startDate || endDate || !hoveredDate) return false;
    const date = dateStr;
    const start = startDate;
    const hovered = hoveredDate;
    
    if (hovered >= start) {
      return date > start && date < hovered;
    } else {
      return date > hovered && date < start;
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-lg border-r border-gray-200 shadow-xl transition-all duration-300 z-40 ${
        isOpen ? 'w-96' : 'w-0'
      } overflow-hidden`}>
        <div className="p-6 pt-20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">New Query Submission</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Part ID Selection */}
            <PartIdSelector
              validProducts={validProducts}
              selectedPartId={selectedPartId}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onPartIdSelect={(partId) => {
                setSelectedPartId(partId);
                setSearchTerm(partId);
              }}
              onPartIdClear={handleClearSelection}
            />

            {/* Add New Part ID Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsAddPartIdModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <span className="text-lg">+</span>
                Add New Part ID
              </button>
            </div>

            {/* Calendar Section - Auto-expands when Part ID is selected */}
            {selectedPartId && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Select Query Period</span>
                </div>
              </div>
            )}

            {/* Calendar - Auto-shows when Part ID is selected */}
            {selectedPartId && availableDates.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-inner">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, index) => {
                    const isSelected = day.dateStr === startDate || day.dateStr === endDate;
                    const isInRange = startDate && endDate && day.dateStr >= startDate && day.dateStr <= endDate;
                    const isInPreviewRange = isDateInPreviewRange(day.dateStr);
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateClick(day.dateStr, day.isAvailable)}
                        onMouseEnter={() => handleDateHover(day.dateStr)}
                        onMouseLeave={() => setHoveredDate('')}
                        disabled={!day.isAvailable || !day.isCurrentMonth}
                        className={`
                          w-8 h-8 text-xs rounded transition-all duration-150 relative
                          ${!day.isCurrentMonth 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : day.isAvailable 
                              ? 'hover:bg-blue-100 cursor-pointer' 
                              : 'cursor-not-allowed opacity-50'
                          }
                          ${isSelected 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : day.isAvailable && day.isCurrentMonth
                              ? 'bg-blue-100 text-blue-800' 
                              : availableDates.includes(day.dateStr) && day.isCurrentMonth
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-400'
                          }
                          ${isInRange && day.isCurrentMonth && !isSelected ? 'bg-blue-600 text-white' : ''}
                          ${isInPreviewRange && day.isCurrentMonth && !isSelected ? 'bg-blue-600 text-white opacity-70' : ''}
                          ${day.isToday ? 'ring-2 ring-blue-300' : ''}
                        `}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>
                
                {(startDate || endDate) && (
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Start: <span className="font-medium">{startDate || 'Not selected'}</span></span>
                      <span>End: <span className="font-medium">{endDate || 'Not selected'}</span></span>
                    </div>
                    {startDate && endDate && (
                      <div className="mt-2 text-xs text-blue-600">
                        Period: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
                      </div>
                    )}
                    <div className="mt-3 text-xs">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-100 rounded border"></div>
                          <span>Available for query</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-red-100 rounded border"></div>
                          <span>Already exists</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedPartId || !startDate || !endDate || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Query'}
            </button>
          </form>
        </div>
      </div>

      {/* Add Part ID Modal */}
      <AddPartIdModal
        isOpen={isAddPartIdModalOpen}
        onClose={() => setIsAddPartIdModalOpen(false)}
        onSuccess={handleAddPartIdSuccess}
        onError={handleAddPartIdError}
      />
    </>
  );
};

export default Sidebar;