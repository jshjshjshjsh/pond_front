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

/**
 * ✨ 1. CustomToolbar 컴포넌트 수정 ✨
 * * 월 이동이 시작되는 시점을 알려주는 onNavigationStart 함수를 props로 받습니다.
 * 사용자가 이전/오늘/다음 버튼을 클릭하면, onNavigationStart를 먼저 실행하여
 * 'loaded' 클래스를 제거한 후, 실제 월 이동(onNavigate)을 실행합니다.
 */
const CustomToolbar = ({ label, onNavigate, onNavigationStart }) => {

    const handleNavClick = (action) => {
        onNavigationStart(); // 월 이동 시작 전 클래스 제거 함수 호출
        onNavigate(action);  // 기존의 월 이동 함수 호출
    };

    return (
        <div className="custom-toolbar">
            <div className="toolbar-nav-buttons">
                <button type="button" onClick={() => handleNavClick('PREV')}>&lt;</button>
                <button type="button" onClick={() => handleNavClick('TODAY')}>오늘</button>
                <button type="button" onClick={() => handleNavClick('NEXT')}>&gt;</button>
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
    const [isReselecting, setIsReselecting] = useState(false);

    const token = localStorage.getItem('accessToken');
    const { events, fetchEvents, saveEvent, updateEvent, deleteEvent } = useCalendarEvents(token);

    useEffect(() => {
        fetchEvents(currentDate);
    }, [currentDate, fetchEvents]);

    /**
     * ✨ 2. 월 이동 시작 시 'loaded' 클래스를 제거하는 함수 ✨
     * * 이 함수는 CustomToolbar의 버튼이 클릭될 때 호출됩니다.
     */
    const handleNavigationStart = useCallback(() => {
        document.querySelectorAll('.rbc-month-row').forEach(row => {
            row.classList.remove('loaded');
        });
    }, []);

    /**
     * ✨ 3. 월 이동 완료 후 'loaded' 클래스를 추가하는 로직 ✨
     * * 월(currentDate)이 바뀌거나 이벤트가 업데이트되면, 캘린더 렌더링이 끝난 후
     * 'loaded' 클래스를 다시 추가하여 높이 문제를 해결합니다.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            document.querySelectorAll('.rbc-month-row').forEach(row => {
                row.classList.add('loaded');
            });
        }, 10); // 미세한 지연으로 렌더링 완료를 보장합니다.

        return () => clearTimeout(timer);
    }, [currentDate, events]);


    const handleCancel = () => {
        setSelectedEvent(null);
        setSelection({ start: null, end: null });
        setTempStart(null);
        setFormState(initialFormState);
        setIsReselecting(false);
    };

    const handleNavigate = (newDateOrAction) => {
        setCurrentDate(current => {
            if (typeof newDateOrAction === 'string') {
                const newDate = new Date(current);
                if (newDateOrAction === 'PREV') newDate.setMonth(newDate.getMonth() - 1);
                if (newDateOrAction === 'NEXT') newDate.setMonth(newDate.getMonth() + 1);
                if (newDateOrAction === 'TODAY') {
                    handleCancel();
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
                if (!isReselecting) handleCancel();
                setTempStart(start);
            } else {
                setSelection({ start: new Date(Math.min(tempStart.getTime(), start.getTime())), end: new Date(Math.max(tempStart.getTime(), start.getTime())) });
                setTempStart(null);
                setIsReselecting(false);
            }
        }
    }, [tempStart, isReselecting]);

    const handleSelectEvent = useCallback((event) => {
        setSelectedEvent(event);
        setSelection({ start: event.start, end: event.end });
        setTempStart(null);
        setFormState({ title: event.title, content: event.content || '', isShare: event.isShare !== false });
        setIsReselecting(false);
    }, []);

    const handleChangeDateClick = () => {
        setIsReselecting(true);
        setSelection({ start: null, end: null });
        setTempStart(null);
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormState(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formState.title.trim() || !selection.start || !selection.end) {
            alert('일정 제목과 날짜를 모두 올바르게 입력해주세요.');
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

            if (event.isShare) style.border = '2px solid #50E3C2';
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
        if (selectedEvent && isReselecting) return '새로운 날짜 범위를 선택하세요.';
        if (selectedEvent) return `기존 기간: ${format(selectedEvent.start, 'yyyy-MM-dd')} ~ ${format(selectedEvent.end, 'yyyy-MM-dd')}`;
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
                        // ✨ 4. Calendar에 CustomToolbar와 클래스 제거 함수를 전달합니다. ✨
                        components={{
                            toolbar: (props) => (
                                <CustomToolbar {...props} onNavigationStart={handleNavigationStart} />
                            ),
                        }}
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
                                {selectedEvent && (
                                    <button type="button" className="action-btn change-date-btn" onClick={handleChangeDateClick}>
                                        날짜 변경
                                    </button>
                                )}
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