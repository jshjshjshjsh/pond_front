// src/calendar/useCalendarEvents.js

import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import format from 'date-fns/format';
import { useNavigate } from 'react-router-dom';

export const useCalendarEvents = (token) => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    const fetchEvents = useCallback(async (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        try {
            const response = await axiosInstance.get('/calendar/workhistory/list', {
                params: { startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') },
            });

            const formattedEvents = response.data.map(event => ({
                ...event,
                // ✨ 1번 문제 해결: workHistoryId 또는 id 필드 모두를 확인하여 ID 설정
                id: event.workHistoryId || event.id,
                start: new Date(event.startDate),
                end: new Date(event.endDate)
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error('일정 데이터를 불러오는 데 실패했습니다.', error);
        }
    }, [token, navigate]);

    const saveEvent = async (newEventData) => {
        return axiosInstance.post('/calendar/workhistory/save', newEventData, {
        });
    };

    const updateEvent = async (eventId, updatedEventData) => {
        return axiosInstance.patch(`/calendar/workhistory/${eventId}`, updatedEventData, {

        });
    };

    const deleteEvent = async (eventId) => {
        return axiosInstance.delete(`/calendar/workhistory/${eventId}`, {

        });
    };

    return { events, fetchEvents, saveEvent, updateEvent, deleteEvent };
};