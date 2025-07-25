// src/calendar/CalendarPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { addWeeks, subWeeks } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css';

import { useCalendarEvents } from './useCalendarEvents';

const locales = { 'ko': ko };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CustomToolbar = ({ label, onNavigate, onPrevWeek, onNextWeek }) => {
    return (
        <div className="custom-toolbar">
            <div className="toolbar-nav-buttons">
                <button type="button" onClick={() => onNavigate('PREV')}>&lt;</button>
                <button type="button" onClick={() => onNavigate('TODAY')}>오늘</button>
                <button type="button" onClick={() => onNavigate('NEXT')}>&gt;</button>
            </div>
            <div className="toolbar-center">
                <span className="toolbar-label">{label}</span>
                <div className="week-nav-buttons">
                    <button type="button" onClick={onPrevWeek}>이전 주</button>
                    <button type="button" onClick={onNextWeek}>다음 주</button>
                </div>
            </div>
            <div className="toolbar-nav-buttons"></div>
        </div>
    );
};

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selection, setSelection] = useState({ start: null, end: null });
    const [tempStart, setTempStart] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const initialFormState = { title: '', content: '', isShare: true };
    const [formState, setFormState] = useState(initialFormState);

    const token = localStorage.getItem('accessToken');
    const { events, fetchEvents, saveEvent, updateEvent, deleteEvent } = useCalendarEvents(token);

    useEffect(() => { fetchEvents(currentDate); }, [currentDate, fetchEvents]);
    useEffect(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
            document.querySelectorAll('.rbc-month-row').forEach(row => row.classList.add('loaded'));
        }));
    }, [events, currentDate]);

    const handleCancel = () => {
        setSelectedEvent(null);
        setSelection({ start: null, end: null });
        setTempStart(null);
        setFormState(initialFormState);
    };

    // ✨ 문제 해결: useCallback을 사용하여 함수를 메모이제이션하고,
    // 상태 업데이트 시 함수형 업데이트를 사용하여 항상 최신 상태를 참조하도록 합니다.
    const handleNavigate = useCallback((actionOrDate) => {
        handleCancel();
        if (typeof actionOrDate === 'string') {
            setCurrentDate(current => {
                const newDate = new Date(current);
                if (actionOrDate === 'PREV') newDate.setMonth(newDate.getMonth() - 1);
                if (actionOrDate === 'NEXT') newDate.setMonth(newDate.getMonth() + 1);
                if (actionOrDate === 'TODAY') return new Date();
                return newDate;
            });
        } else {
            setCurrentDate(actionOrDate);
        }
    }, []);

    const goToPrevWeek = useCallback(() => setCurrentDate(current => subWeeks(current, 1)), []);
    const goToNextWeek = useCallback(() => setCurrentDate(current => addWeeks(current, 1)), []);

    const handleSelectSlot = useCallback(({ start, action }) => {
        handleCancel();
        if (action === 'click') {
            if (!tempStart) {
                setTempStart(start);
            } else {
                setSelection({ start: new Date(Math.min(tempStart.getTime(), start.getTime())), end: new Date(Math.max(tempStart.getTime(), start.getTime())) });
                setTempStart(null);
            }
        }
    }, [tempStart]);

    const handleSelectEvent = useCallback((event) => {
        setSelectedEvent(event);
        setSelection({ start: event.start, end: event.end });
        setTempStart(null);
        setFormState({ title: event.title, content: event.content || '', isShare: event.isShare !== false });
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formState.title.trim() || !selection.start || !selection.end) {
            alert('일정 제목을 입력하고 날짜를 선택해주세요.');
            return;
        }
        const adjustedEndDate = new Date(selection.end);
        adjustedEndDate.setHours(23, 59, 59, 999);
        const eventData = { ...formState, startDate: format(selection.start, "yyyy-MM-dd'T'HH:mm:ss"), endDate: format(adjustedEndDate, "yyyy-MM-dd'T'HH:mm:ss") };
        try {
            if (selectedEvent) {
                await updateEvent(selectedEvent.id, { ...eventData, workHistoryId: selectedEvent.id });
                alert('일정이 수정되었습니다.');
            } else {
                await saveEvent(eventData);
                alert('일정이 저장되었습니다.');
            }
            handleCancel();
            await fetchEvents(currentDate);
        } catch (error) {
            console.error('작업 처리 중 오류 발생:', error);
            alert('작업 처리 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent || !window.confirm('정말로 이 일정을 삭제하시겠습니까?')) return;
        try {
            await deleteEvent(selectedEvent.id);
            alert('일정이 삭제되었습니다.');
            handleCancel();
            await fetchEvents(currentDate);
        } catch (error) {
            console.error('일정 삭제에 실패했습니다.', error);
            alert('일정 삭제 중 오류가 발생했습니다.');
        }
    };

    // ✨ 선택된 일정 하이라이트 스타일 개선
    const eventPropGetter = useCallback(
        (event) => {
            const isSelected = selectedEvent?.id === event.id;
            const style = {
                backgroundColor: '#008080',
                color: 'white',
                borderRadius: '6px',
                border: '1px solid transparent',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
            };

            if (event.isShare) {
                style.border = '2px solid #50E3C2';
            }
            if (isSelected) {
                style.backgroundColor = '#005f5f'; // 더 진한 배경색
                style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; // 더 강한 그림자
            }

            return { style };
        },
        [selectedEvent]
    );

    const dayPropGetter = useCallback((date) => {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const isInRange = (start, end) => start && end && d >= start && d <= end;
        if (isInRange(selection.start, selection.end) || (tempStart && d.getTime() === new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate()).getTime())) {
            return { style: { backgroundColor: 'rgba(0, 128, 128, 0.15)', borderRadius: '4px' } };
        }
        return {};
    }, [selection, tempStart]);

    const renderSelectionText = () => {
        if (selection.start && selection.end) return `선택 기간: ${format(selection.start, 'yyyy-MM-dd')} ~ ${format(selection.end, 'yyyy-MM-dd')}`;
        if (tempStart) return `시작일: ${format(tempStart, 'yyyy-MM-dd')} (종료일을 선택하세요)`;
        return '날짜를 클릭하여 기간을 선택하세요.';
    };

    // useMemo 최적화를 제거하여 컴포넌트가 항상 최신 props를 받도록 합니다.
    const calendarFormats = {
        monthHeaderFormat: 'yyyy년 MMMM',
        dayHeaderFormat: 'eee',
    };
    const calendarMessages = {
        today: '오늘', previous: '이전', next: '다음', month: '월',
        week: '주', day: '일', agenda: '일정',
        noEventsInRange: '해당 기간에 일정이 없습니다.',
        showMore: total => `+${total}개 더보기`,
    };

    return (
        <div className="calendar-page-container">
            <div className="calendar-layout-container">
                <div className="calendar-wrapper">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        // ✨ CustomToolbar에 이동 함수를 직접 전달
                        components={{
                            toolbar: (props) => (
                                <CustomToolbar
                                    {...props}
                                    onNavigate={handleNavigate}
                                    onPrevWeek={goToPrevWeek}
                                    onNextWeek={goToNextWeek}
                                />
                            ),
                        }}
                        formats={calendarFormats}
                        messages={calendarMessages}
                        culture='ko'
                        startAccessor="start"
                        endAccessor="end"
                        views={['month']}
                        date={currentDate}
                        onNavigate={handleNavigate}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventPropGetter}
                        dayPropGetter={dayPropGetter}
                    />
                </div>
                <div className="form-wrapper">
                    <div className="event-form-container">
                        <h3>{selectedEvent ? '일정 수정' : '새 일정 추가'}</h3>
                        <p className="selection-display"><strong>{renderSelectionText()}</strong></p>
                        {(selection.start || selectedEvent) && (
                            <form onSubmit={handleSubmit} className="event-form">
                                <div className="input-group">
                                    <label htmlFor="title">일정 제목</label>
                                    <input type="text" id="title" name="title" value={formState.title} onChange={handleFormChange} placeholder="무엇을 하셨나요?" required />
                                </div>
                                <div className="input-group">
                                    <label htmlFor="content">상세 내용</label>
                                    <textarea id="content" name="content" value={formState.content} onChange={handleFormChange} placeholder="상세 업무 내용을 입력하세요." rows="4"></textarea>
                                </div>
                                <div className="input-group">
                                    <label>공유 여부</label>
                                    <div className="share-toggle">
                                        <span>비공개</span>
                                        <label className="switch"><input type="checkbox" name="isShare" checked={formState.isShare} onChange={handleFormChange} /><span className="slider round"></span></label>
                                        <span>팀 공유</span>
                                    </div>
                                </div>
                                {selectedEvent ? (
                                    <div className="form-actions">
                                        <button type="submit" className="action-btn update-btn">수정하기</button>
                                        <button type="button" onClick={handleDelete} className="action-btn delete-btn">삭제하기</button>
                                        <button type="button" onClick={handleCancel} className="action-btn cancel-btn">취소</button>
                                    </div>
                                ) : (
                                    <button type="submit" className="submit-btn" disabled={!selection.start}>저장하기</button>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;