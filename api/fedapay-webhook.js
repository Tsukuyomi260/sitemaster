const { createClient } = require('@supabase/supabase-js');

// Utilise la Service Role Key (accès complet, côté serveur uniquement)
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * FedaPay Webhook Handler
 * URL de production : https://ton-app.vercel.app/api/fedapay-webhook
 *
 * FedaPay envoie un POST JSON avec la structure :
 * {
 *   "name": "transaction.approved" | "transaction.declined" | "transaction.cancelled",
 *   "object": "event",
 *   "data": {
 *     "object": {
 *       "id": 12345,
 *       "reference": "FP-REF-XXX",
 *       "amount": 451500,
 *       "status": "approved",
 *       "custom_metadata": { "payment_id": "uuid-interne" }
 *     }
 *   }
 * }
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    console.log('[FedaPay Webhook] Event reçu:', JSON.stringify(event, null, 2));

    // Extraire la transaction selon la structure FedaPay
    const transaction = event.data?.object ?? event.transaction ?? null;

    if (!transaction) {
      console.error('[FedaPay Webhook] Payload invalide — pas de transaction');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Mapper le nom de l'événement vers notre statut interne
    const eventName = event.name || '';
    const status =
      eventName.includes('approved') || transaction.status === 'approved' ? 'approved'
      : eventName.includes('declined') || transaction.status === 'declined' ? 'declined'
      : 'cancelled';

    const fedapayId   = String(transaction.id ?? '');
    const reference   = transaction.reference ?? '';
    const paymentId   = transaction.custom_metadata?.payment_id ?? null;

    console.log(`[FedaPay Webhook] status=${status}, fedapay_id=${fedapayId}, payment_id=${paymentId}`);

    if (!paymentId) {
      // Pas de payment_id interne : on essaie de matcher par fedapay_transaction_id
      const { error } = await supabase
        .from('payments')
        .update({
          status,
          fedapay_transaction_id: fedapayId,
          fedapay_reference: reference,
          updated_at: new Date().toISOString(),
        })
        .eq('fedapay_transaction_id', fedapayId);

      if (error) console.error('[FedaPay Webhook] Supabase update error (by fedapay_id):', error);
    } else {
      // Mise à jour par l'ID interne — approche la plus fiable
      const { error } = await supabase
        .from('payments')
        .update({
          status,
          fedapay_transaction_id: fedapayId,
          fedapay_reference: reference,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId);

      if (error) console.error('[FedaPay Webhook] Supabase update error (by payment_id):', error);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[FedaPay Webhook] Erreur non gérée:', err);
    return res.status(500).json({ error: err.message });
  }
};
