// src/services/payment-service.ts
import api from '@/lib/api';

export interface PaymentInstructions {
  amount: number;
  code: string;
  method?: string;
  bankAccount?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  note?: string;
  qrUrl?: string; // ← IMPORTANT: QR from backend
}

export interface StartPaymentResponse {
  message: string;
  transactionId: string;
  instructions: PaymentInstructions;
}

const paymentService = {
  async startPayment(orderId: string, amount: number): Promise<StartPaymentResponse> {
    const res = await api.post('/payments/start', { orderId, amount });
    return res.data;
  },
};

export default paymentService;