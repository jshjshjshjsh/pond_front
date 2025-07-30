import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axiosInstance from '../api/axiosInstance';
import { useCalendarEvents } from './useCalendarEvents';
import './CalendarPage.css';
import { RiSparkling2Line } from "react-icons/ri";
import { jwtDecode } from 'jwt-decode'; //  JWT 디코딩 라이브러리 import

const locales = { 'ko': ko };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const CustomToolbar = ({ label, onNavigate, onNavigationStart }) => {
    const handleNavClick = (action) => {
        onNavigationStart();
        onNavigate(action);
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

    const [listStartDate, setListStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [listEndDate, setListEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [aiSummary, setAiSummary] = useState('');

    const [savedSummaries, setSavedSummaries] = useState([]);
    const [isShareSummary, setIsShareSummary] = useState(true);
    const [summaryDate, setSummaryDate] = useState(new Date());
    const [displayWorkHistory, setDisplayWorkHistory] = useState([]);
    const [isSummarizing, setIsSummarizing] = useState(false);

    //  현재 로그인한 사용자 정보를 저장할 상태
    const [currentUser, setCurrentUser] = useState(null);

    const token = localStorage.getItem('accessToken');
    const { events, fetchEvents, saveEvent, updateEvent, deleteEvent } = useCalendarEvents(token);

    //  컴포넌트 마운트 시 토큰에서 사용자 정보 추출
    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Spring Security 권한(auth)과 사용자 ID(sub)를 상태에 저장
                setCurrentUser({
                    id: decoded.sub, // 'sub' 클레임에 사용자 ID(사번)가 있다고 가정
                    role: decoded.auth
                });
            } catch (error) {
                console.error("토큰 디코딩 실패:", error);
            }
        }
    }, [token]);


    const fetchSavedSummaries = useCallback(async (date) => {
        //  currentUser 정보가 없으면 함수를 실행하지 않음
        if (!currentUser) return;

        try {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            //  사용자의 역할에 따라 다른 API 엔드포인트 결정
            const url = currentUser.role.includes('LEADER')
                ? '/calendar/leader/worksummary/list'
                : '/calendar/worksummary/list';

            const response = await axiosInstance.get(url, {
                params: { year, month }
            });
            setSavedSummaries(response.data);
        } catch (error) {
            console.error('저장된 요약 목록 조회 실패:', error);
        }
    }, [currentUser]); //  currentUser가 변경될 때마다 함수를 재생성


    useEffect(() => {
        fetchEvents(currentDate);
        if (currentUser) { //  currentUser가 설정된 후에 요약 목록을 불러오도록 함
            fetchSavedSummaries(summaryDate);
        }
    }, [currentDate, fetchEvents, summaryDate, fetchSavedSummaries, currentUser]);

    const handleNavigationStart = useCallback(() => {
        document.querySelectorAll('.rbc-month-row').forEach(row => {
            row.classList.remove('loaded');
        });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            document.querySelectorAll('.rbc-month-row').forEach(row => {
                row.classList.add('loaded');
            });
        }, 10);
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

    const handleFetchWorkHistoryList = async () => {
        try {
            const response = await axiosInstance.get('/calendar/workhistory/list', {
                params: {
                    startDate: listStartDate,
                    endDate: listEndDate
                }
            });
            setDisplayWorkHistory(response.data);
        } catch (error) {
            console.error('업무 목록 조회 실패:', error);
            alert('업무 목록을 불러오는 데 실패했습니다.');
        }
    };

    const handleHideHistoryItem = (id) => {
        setDisplayWorkHistory(prevList => prevList.filter(item => item.id !== id));
    };

    const handleAiSummary = async () => {
        if (displayWorkHistory.length === 0) {
            alert('요약할 업무 데이터가 없습니다. 먼저 목록을 조회해주세요.');
            return;
        }

        setIsSummarizing(true);
        setAiSummary('');

        const titles = displayWorkHistory.map(item => item.title).join('\n');

        try {
            const response = await axiosInstance.post('/ai/summary', {
                params: {
                    requireString: titles
                }
            });

            const summaryText = `[요약된 업무 목록]\n선택된 기간(${listStartDate} ~ ${listEndDate}) 동안 총 ${displayWorkHistory.length}개의 업무가 기록되었습니다.\n\n${response.data}`;
            setAiSummary(summaryText);
        } catch (error) {
            console.error("AI 요약 실패:", error);
            setAiSummary("AI 요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            alert("AI 요약 중 오류가 발생했습니다.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleSaveSummary = async () => {
        if (!aiSummary.trim()) {
            alert('저장할 요약 내용이 없습니다.');
            return;
        }

        const year = new Date(listStartDate).getFullYear();
        const month = new Date(listStartDate).getMonth() + 1;

        const summaryData = {
            year,
            month,
            summary: aiSummary,
            isShare: isShareSummary,
        };

        try {
            await axiosInstance.post('/calendar/worksummary', summaryData);
            alert('요약이 성공적으로 저장되었습니다.');
            setAiSummary('');
            fetchSavedSummaries(summaryDate);
        } catch (error) {
            console.error("AI 요약 저장 실패:", error);
            alert("AI 요약 저장 중 오류가 발생했습니다.");
        }
    };

    const handleDeleteSummary = async (summaryId) => {
        if (!window.confirm('정말로 이 요약을 삭제하시겠습니까?')) return;
        try {
            await axiosInstance.delete(`/calendar/worksummary/${summaryId}`);
            alert('요약이 삭제되었습니다.');
            fetchSavedSummaries(summaryDate);
        } catch (error) {
            console.error("요약 삭제 실패:", error);
            alert(error.response?.data?.message || "요약 삭제 중 오류가 발생했습니다.");
        }
    };

    const handleToggleShare = async (summary) => {
        try {
            await axiosInstance.patch('/calendar/worksummary', {
                id: summary.id,
                isShare: !summary.isShare
            });
            fetchSavedSummaries(summaryDate);
        } catch (error) {
            console.error("공유 상태 변경 실패:", error);
            alert("공유 상태 변경 중 오류가 발생했습니다.");
        }
    };

    const eventPropGetter = useCallback((event) => {
        const isSelected = selectedEvent?.id === event.id;
        const style = { backgroundColor: '#008080', color: 'white', borderRadius: '6px', border: '1px solid transparent', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' };
        if (event.isShare) style.border = '2px solid #50E3C2';
        if (isSelected) {
            style.backgroundColor = '#005f5f';
            style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }
        return { style };
    }, [selectedEvent]);

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
        messages: { today: '오늘', previous: '이전', next: '다음', month: '월', week: '주', day: '일', agenda: '일정', noEventsInRange: '해당 기간에 일정이 없습니다.', showMore: total => `+${total}개 더보기` }
    }), []);

    return (
        <div className="calendar-page-container">
            <div className="calendar-layout-container">
                <div className="calendar-wrapper">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        components={{ toolbar: (props) => (<CustomToolbar {...props} onNavigationStart={handleNavigationStart} />) }}
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
                                {selectedEvent && (<button type="button" className="action-btn change-date-btn" onClick={handleChangeDateClick}>날짜 변경</button>)}
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

            <div className="work-history-list-container">
                <h3>업무 목록 조회</h3>
                <div className="date-range-selector">
                    <div className="input-group">
                        <label htmlFor="list-start-date">시작일</label>
                        <input type="date" id="list-start-date" value={listStartDate} onChange={(e) => setListStartDate(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label htmlFor="list-end-date">종료일</label>
                        <input type="date" id="list-end-date" value={listEndDate} onChange={(e) => setListEndDate(e.target.value)} />
                    </div>
                    <button onClick={handleFetchWorkHistoryList} className="fetch-list-btn">조회</button>
                    <button onClick={handleAiSummary} className="ai-summary-btn" disabled={isSummarizing}>
                        {isSummarizing ? (
                            <><span className="spinner"></span> 요약 중...</>
                        ) : (
                            <><RiSparkling2Line/> AI 요약하기</>
                        )}
                    </button>
                </div>
                <div className="history-results-grid">
                    {displayWorkHistory.length > 0 ? (
                        displayWorkHistory.map(item => (
                            <div key={item.id} className="history-item-label">
                                <span className="date">{format(new Date(item.startDate), 'MM/dd')}</span>
                                <span>{item.title}</span>
                                <button className="delete-history-item-btn" onClick={() => handleHideHistoryItem(item.id)}>×</button>
                            </div>
                        ))
                    ) : (<p>해당 기간에 조회된 업무가 없습니다.</p>)}
                </div>
                <div className="ai-summary-container">
                    <textarea
                        className="ai-summary-textarea"
                        value={aiSummary}
                        placeholder="'AI 요약하기' 버튼을 클릭하면 이곳에 결과가 표시됩니다."
                    />
                    {aiSummary && (
                        <div className="ai-summary-actions">
                            <div className="share-toggle">
                                <span>비공개</span>
                                <label className="switch">
                                    <input type="checkbox" checked={isShareSummary} onChange={(e) => setIsShareSummary(e.target.checked)} />
                                    <span className="slider round"></span>
                                </label>
                                <span>팀 공유</span>
                            </div>
                            <button onClick={handleSaveSummary} className="save-summary-btn">요약 저장</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="work-summary-container">
                <h3>월별 업무 요약</h3>
                <div className="summary-controls">
                    <input type="month" value={format(summaryDate, 'yyyy-MM')} onChange={(e) => setSummaryDate(new Date(e.target.value))} />
                </div>
                <div className="summary-list">
                    {savedSummaries.length > 0 ? (
                        savedSummaries.map(summary => {
                            //  현재 사용자가 요약의 소유자인지 확인
                            const isOwner = currentUser && currentUser.id === summary.member.id;
                            return (
                                <div key={summary.id} className="summary-item">
                                    <div className="summary-header">
                                        <div className="summary-info">
                                            <strong>{summary.member.name}</strong>
                                            <span
                                                className={`share-status ${summary.isShare ? 'shared' : 'private'} ${isOwner ? 'clickable' : ''}`}
                                                //  소유자일 경우에만 onClick 이벤트 핸들러 연결
                                                onClick={isOwner ? () => handleToggleShare(summary) : null}
                                                title={isOwner ? "클릭하여 공유 상태 변경" : null}
                                            >
                                                {summary.isShare ? '공유됨' : '비공개'}
                                            </span>
                                        </div>
                                        {/*  소유자일 경우에만 삭제 버튼 렌더링 */}
                                        {isOwner && (
                                            <button className="delete-summary-btn" onClick={() => handleDeleteSummary(summary.id)}>
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <pre className="summary-content">{summary.summary}</pre>
                                </div>
                            );
                        })
                    ) : (
                        <p>해당 월에 저장된 요약이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;