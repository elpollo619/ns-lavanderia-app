import { useCallback, useEffect, useState } from 'react';
import { listMachines } from '@/api/machines';
import {
  createReservation,
  listReservationsForMachine,
  attachPaymentIntent,
} from '@/api/reservations';
import { addMinutes } from '@/utils/calendar';
import type { DurationMinutes, Machine, Reservation } from '@/types/database';

export type FlowStep = 'machine' | 'datetime' | 'summary';

interface UseReservationFlowResult {
  // Estado del flujo
  step: FlowStep;
  setStep: (s: FlowStep) => void;

  // Datos
  machines: Machine[];
  loadingMachines: boolean;
  existingReservations: Reservation[];

  // Selección
  selectedMachine: Machine | null;
  selectedDate: Date | null;
  selectedTime: Date | null;
  selectedDuration: DurationMinutes;

  // Setters
  selectMachine: (m: Machine) => void;
  selectDate: (d: Date) => void;
  selectTime: (t: Date) => void;
  selectDuration: (d: DurationMinutes) => void;

  // Acciones
  canGoToDateTime: boolean;
  canGoToSummary: boolean;
  submitReservation: () => Promise<Reservation>;
  confirmPayment: (reservationId: string, paymentIntentId: string) => Promise<void>;
  reset: () => void;

  error: string | null;
}

/**
 * Hook orquestador del flujo de reserva en 3 pasos.
 * Carga máquinas al inicio y reservas existentes cuando cambian
 * la máquina o el día, para poder bloquear slots ocupados.
 */
export function useReservationFlow(userId: string | null): UseReservationFlowResult {
  const [step, setStep] = useState<FlowStep>('machine');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(60);

  const [error, setError] = useState<string | null>(null);

  // Cargar máquinas
  useEffect(() => {
    let cancelled = false;
    listMachines()
      .then((data) => {
        if (!cancelled) setMachines(data);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoadingMachines(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar reservas existentes cuando cambia máquina o día
  useEffect(() => {
    if (!selectedMachine || !selectedDate) return;
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    listReservationsForMachine(selectedMachine.id, dayStart, dayEnd)
      .then(setExistingReservations)
      .catch((e) => setError(e.message));
  }, [selectedMachine, selectedDate]);

  const selectMachine = useCallback((m: Machine) => {
    setSelectedMachine(m);
    setSelectedTime(null);
  }, []);

  const selectDate = useCallback((d: Date) => {
    setSelectedDate(d);
    setSelectedTime(null);
  }, []);

  const submitReservation = useCallback(async () => {
    if (!userId) throw new Error('Nicht angemeldet');
    if (!selectedMachine || !selectedTime) {
      throw new Error('Maschine und Zeit müssen ausgewählt sein');
    }
    const endTime = addMinutes(selectedTime, selectedDuration);
    return createReservation({
      userId,
      machineId: selectedMachine.id,
      startTime: selectedTime,
      endTime,
    });
  }, [userId, selectedMachine, selectedTime, selectedDuration]);

  const confirmPayment = useCallback(
    async (reservationId: string, paymentIntentId: string) => {
      await attachPaymentIntent(reservationId, paymentIntentId);
    },
    [],
  );

  const reset = useCallback(() => {
    setStep('machine');
    setSelectedMachine(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedDuration(60);
    setError(null);
  }, []);

  return {
    step,
    setStep,
    machines,
    loadingMachines,
    existingReservations,
    selectedMachine,
    selectedDate,
    selectedTime,
    selectedDuration,
    selectMachine,
    selectDate,
    selectTime: setSelectedTime,
    selectDuration: setSelectedDuration,
    canGoToDateTime: !!selectedMachine,
    canGoToSummary: !!selectedMachine && !!selectedTime,
    submitReservation,
    confirmPayment,
    reset,
    error,
  };
}
