// src/calendar/CalendarPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarPage.css';

import { useCalendarEvents } from './useCalendarEvents';

const locales = { 'ko': ko };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CustomToolbar = ({ label, onNavigate }) => {
    return (
        <div className="custom-toolbar">
            <div className="toolbar-nav-buttons">
                <button type="button" onClick={() => onNavigate('PREV')}>&lt;</button>
                <button type="button" onClick={() => onNavigate('TODAY')}>오늘</button>
                <button type="button" onClick={() => onNavigate('NEXT')}>&gt;</button>
            </div>
            <div className="toolbar-center">
                <span className="toolbar-label">{label}</span>
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

    // ✨ 요청하신 코드 복원
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

    // ✨ 문제 해결: 월 이동 시 tempStart가 초기화되지 않도록 handleCancel() 호출을 제거
    const handleNavigate = (newDateOrAction) => {
        setCurrentDate(current => {
            if (typeof newDateOrAction === 'string') {
                const newDate = new Date(current);
                if (newDateOrAction === 'PREV') newDate.setMonth(newDate.getMonth() - 1);
                if (newDateOrAction === 'NEXT') newDate.setMonth(newDate.getMonth() + 1);
                if (newDateOrAction === 'TODAY') {
                    handleCancel(); // '오늘' 버튼을 누를 때만 선택을 초기화
                    return new Date();
                }
                return newDate;
            }
            return newDateOrAction;
        });
    };

    const handleSelectSlot = useCallback(({ start, action }) => {
        if (action === 'click') {
            if (!tempStart) {
                handleCancel(); // 새로운 선택을 시작할 때만 모든 상태를 초기화
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
                style.backgroundColor = '#005f5f';
                style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
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

    const { formats, messages } = useMemo(() => ({
        formats: { monthHeaderFormat: 'yyyy년 MMMM', dayHeaderFormat: 'eee' },
        messages: {
            today: '오늘', previous: '이전', next: '다음', month: '월',
            week: '주', day: '일', agenda: '일정',
            noEventsInRange: '해당 기간에 일정이 없습니다.',
            showMore: total => `+${total}개 더보기`,
        }
    }), []);

    return (
        <div className="calendar-page-container">
            <div className="calendar-layout-container">
                <div className="calendar-wrapper">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        components={{ toolbar: CustomToolbar }}
                        formats={formats}
                        messages={messages}
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
                        {(selection.start || selectedEvent || tempStart) && (
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