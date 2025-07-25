import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CalendarPage.css';
import enUS from 'date-fns/locale/en-US';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CustomToolbar = (toolbar) => {
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToCurrent = () => toolbar.onNavigate('TODAY');

    return (
        <div className="custom-toolbar">
            <div className="toolbar-nav-buttons">
                <button type="button" onClick={goToBack}>&lt;</button>
                <button type="button" onClick={goToCurrent}>오늘</button>
                <button type="button" onClick={goToNext}>&gt;</button>
            </div>
            <div className="toolbar-center">
                <span className="toolbar-label">{toolbar.label}</span>
            </div>
            <div className="toolbar-nav-buttons"></div>
        </div>
    );
};

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selection, setSelection] = useState({ start: null, end: null });
    const [tempStart, setTempStart] = useState(null);
    const [title, setTitle] = useState('');
    const [isShare, setIsShare] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    // ✨ 여기가 핵심 1: 캘린더 데이터(events, currentDate)가 변경될 때마다 실행됩니다.
    useEffect(() => {
        // 모든 '.rbc-month-row' 요소를 찾습니다.
        const monthRows = document.querySelectorAll('.rbc-month-row');

        // 찾은 각 요소에 'loaded' 클래스를 추가합니다.
        monthRows.forEach(row => {
            row.classList.add('loaded');
        });
    }, [events, currentDate]); // events나 currentDate가 바뀔 때마다 이 효과를 다시 실행합니다.


    const fetchEvents = useCallback(async (date) => {
        if (!token) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        try {
            const response = await axios.get('http://localhost:8080/calendar/workhistory/list', {
                params: { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const formattedEvents = response.data.map(event => ({
                ...event,
                start: new Date(event.startDate),
                end: new Date(event.endDate)
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('일정 데이터를 불러오는 데 실패했습니다.', error);
        }
    }, [token, navigate]);

    useEffect(() => {
        fetchEvents(currentDate);
    }, [currentDate, fetchEvents]);

    const handleNavigate = (newDate) => setCurrentDate(newDate);

    const handleSelectSlot = useCallback(({ start, action }) => {
        if (action === 'click') {
            if (!tempStart) {
                setTempStart(start);
                setSelection({ start: null, end: null });
            } else {
                const finalStart = new Date(Math.min(tempStart.getTime(), start.getTime()));
                const finalEnd = new Date(Math.max(tempStart.getTime(), start.getTime()));
                setSelection({ start: finalStart, end: finalEnd });
                setTempStart(null);
            }
        }
    }, [tempStart]);

    const dayPropGetter = useCallback((date) => {
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const isInRange = (start, end) => {
            if (!start || !end) return false;
            const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            return dateOnly >= s && dateOnly <= e;
        };
        if (isInRange(selection.start, selection.end) || (tempStart && dateOnly.getTime() === new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate()).getTime())) {
            return { style: { backgroundColor: 'rgba(0, 128, 128, 0.15)', borderRadius: '4px' } };
        }
        return {};
    }, [selection, tempStart]);

    const handleSaveEvent = async (e) => {
        e.preventDefault();
        if (!title.trim() || !selection.start || !selection.end) {
            alert('일정 제목을 입력하고 날짜를 선택해주세요.');
            return;
        }
        const newEvent = {
            title,
            startDate: format(selection.start, "yyyy-MM-dd'T'HH:mm:ss"),
            endDate: format(selection.end, "yyyy-MM-dd'T'HH:mm:ss"),
            isShare,
            content: title,
        };
        try {
            await axios.post('http://localhost:8080/calendar/workhistory/save', newEvent, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('일정이 저장되었습니다.');
            setTitle('');
            setSelection({ start: null, end: null });
            fetchEvents(currentDate);
        } catch (error) {
            console.error('일정 저장에 실패했습니다.', error);
            alert('일정 저장 중 오류가 발생했습니다.');
        }
    };

    const renderSelectionText = () => {
        if (selection.start && selection.end) {
            return `선택된 기간: ${format(selection.start, 'yyyy-MM-dd')} ~ ${format(selection.end, 'yyyy-MM-dd')}`;
        }
        if (tempStart) {
            return `시작일: ${format(tempStart, 'yyyy-MM-dd')} (종료일을 선택하세요)`;
        }
        return '날짜를 클릭하여 기간을 선택하세요.';
    };

    const { components } = useMemo(() => ({
        components: {
            toolbar: CustomToolbar,
        },
    }), []);

    return (
        <div className="calendar-page-container">
            <div className="calendar-layout-container">
                <div className="calendar-wrapper">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        views={['month']}
                        date={currentDate}
                        onNavigate={handleNavigate}
                        selectable
                        onSelectSlot={handleSelectSlot}
                        dayPropGetter={dayPropGetter}
                        components={components}
                    />
                </div>
                <div className="form-wrapper">
                    <div className="event-form-container">
                        <h3>새 일정 추가</h3>
                        <p className="selection-display"><strong>{renderSelectionText()}</strong></p>
                        {(tempStart || selection.start) && (
                            <form onSubmit={handleSaveEvent} className="event-form">
                                <div className="input-group">
                                    <label htmlFor="title">일정 제목</label>
                                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="무엇을 하셨나요?" />
                                </div>
                                <div className="input-group">
                                    <label>공유 여부</label>
                                    <div className="share-toggle">
                                        <span>비공개</span>
                                        <label className="switch">
                                            <input type="checkbox" checked={isShare} onChange={(e) => setIsShare(e.target.checked)} />
                                            <span className="slider round"></span>
                                        </label>
                                        <span>팀 공유</span>
                                    </div>
                                </div>
                                <button type="submit" className="submit-btn" disabled={!selection.start}>저장하기</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;