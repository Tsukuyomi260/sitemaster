import React, { useState, useCallback } from 'react';
import { createPayment, updatePaymentStatus } from '../api';

declare global {
  interface Window { FedaPay: any; }
}

const FEDAPAY_CDN = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
const FEDAPAY_PUBLIC_KEY = process.env.REACT_APP_FEDAPAY_PUBLIC_KEY || '';
const FEDAPAY_ENV = (process.env.REACT_APP_FEDAPAY_ENV || 'sandbox') as 'sandbox' | 'live';

function loadFedaPayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FedaPay) { resolve(); return; }
    const existing = document.getElementById('fedapay-script');
    if (existing) {
      // Si le script existe déjà mais FedaPay pas encore dispo, attendre
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.id = 'fedapay-script';
    script.src = FEDAPAY_CDN;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Impossible de charger le SDK FedaPay'));
    document.head.appendChild(script);
  });
}

export type PaymentType = 'scolarite' | 'laboratoire';

interface FedaPayButtonProps {
  paymentType: PaymentType;
  amount: number;
  description: string;
  studentEmail: string;
  studentName: string;
  studentId?: string;
  matricule?: string;
  /** Appelé quand l'UI doit se rafraîchir (le vrai statut vient du webhook) */
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FedaPayButton: React.FC<FedaPayButtonProps> = ({
  paymentType,
  amount,
  description,
  studentEmail,
  studentName,
  studentId,
  matricule,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children,
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      await loadFedaPayScript();

      // 1. Créer le paiement en BDD → obtenir l'ID interne
      const paymentRecord = await createPayment({
        student_email: studentEmail,
        student_name: studentName,
        student_id: studentId,
        matricule,
        type: paymentType,
        amount,
        description,
        status: 'pending',
      });

      const nameParts = studentName.trim().split(' ');
      const firstname = nameParts[0] || studentName;
      const lastname  = nameParts.slice(1).join(' ') || '';

      // 2. Ouvrir le checkout FedaPay
      //    On passe payment_id dans custom_metadata → le webhook s'en sert
      //    pour retrouver et mettre à jour l'enregistrement Supabase.
      window.FedaPay.init({
        public_key: FEDAPAY_PUBLIC_KEY,
        environment: FEDAPAY_ENV,
        transaction: {
          amount,
          description,
          custom_metadata: {
            payment_id: paymentRecord.id,   // ← clé de réconciliation webhook
          },
        },
        customer: {
          email: studentEmail,
          firstname,
          lastname,
        },

        // 3. onComplete = filet de sécurité UI uniquement.
        //    Le vrai statut est mis à jour par le webhook côté serveur.
        onComplete: async (transaction: any) => {
          // Debug — à retirer après validation
          console.log('[FedaPay onComplete] transaction:', JSON.stringify(transaction, null, 2));

          const reason = (transaction.reason ?? transaction.status ?? '').toUpperCase();
          const status =
            reason === 'APPROVED'  ? 'approved'  :
            reason === 'DECLINED'  ? 'declined'  : 'cancelled';

          // Fallback : si le webhook n'a pas encore tourné, on met à jour ici aussi
          try {
            await updatePaymentStatus(paymentRecord.id, {
              status,
              fedapay_transaction_id: String(transaction.id  ?? ''),
              fedapay_reference:      transaction.reference  ?? '',
            });
          } catch (e) {
            // Le webhook a peut-être déjà mis à jour — on ignore l'erreur
            console.warn('updatePaymentStatus (fallback):', e);
          }

          if (status === 'approved') {
            onSuccess?.();
          } else {
            onError?.(status === 'declined' ? 'Paiement refusé.' : 'Paiement annulé.');
          }
          setLoading(false);
        },
      }).open();

    } catch (err: any) {
      console.error('FedaPay error:', err);
      onError?.(err.message || 'Erreur lors de l\'initialisation du paiement.');
      setLoading(false);
    }
  }, [loading, disabled, studentEmail, studentName, studentId, matricule, paymentType, amount, description, onSuccess, onError]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          Chargement…
        </span>
      ) : children}
    </button>
  );
};

export default FedaPayButton;
