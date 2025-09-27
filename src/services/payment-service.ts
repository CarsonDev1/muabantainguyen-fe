import api from '@/lib/api';

export interface StartPaymentRequest {
  orderId: string;
  amount: number;
}

export interface PaymentInstructions {
  amount: number;
  code: string;
  method?: string;
  bankAccount?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  note?: string;
}

export interface StartPaymentResponse {
  message: string;
  transactionId: string;
  instructions: PaymentInstructions;
}

export interface CheckoutPaymentResponse {
  message: string;
  orderId: string;
  transactionId: string;
  instructions: PaymentInstructions;
}

const paymentService = {
  async startPayment(data: StartPaymentRequest): Promise<StartPaymentResponse> {
    const res = await api.post('/payments/start', data);
    return res.data as StartPaymentResponse;
  },

  async checkoutAndCreatePayment(): Promise<CheckoutPaymentResponse> {
    const res = await api.post('/payments/checkout');
    return res.data as CheckoutPaymentResponse;
  },
};

export default paymentService;


