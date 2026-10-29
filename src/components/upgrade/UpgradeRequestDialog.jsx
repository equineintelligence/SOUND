import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { REQUEST_TYPES } from '@/lib/plans';
import { fieldClass } from '@/lib/yard';

export default function UpgradeRequestDialog({ open, onOpenChange, requestType = 'pro', business }) {
  const [type, setType] = useState(requestType);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(requestType);
    setMessage('');
    setDone(false);
    setError('');
  }, [open, requestType]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const me = await base44.auth.me();
      await base44.entities.UpgradeRequest.create({
        user_id: me.id,
        user_email: me.email,
        user_name: me.full_name || me.email,
        request_type: type,
        business_id: business?.id,
        business_name: business?.name,
        message: message.trim() || undefined,
        status: 'submitted',
      });
      setDone(true);
    } catch (err) {
      setError('That request could not be sent. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-[18px] text-ink">
            {done ? 'Request sent' : 'Request access'}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="space-y-4">
            <p className="text-[14px] leading-relaxed text-ink-soft">
              Your request is with the Sound team. We will send you an invoice for the membership, and
              your access opens as soon as the payment is received.
            </p>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-11 w-full rounded-xl bg-brand text-white hover:bg-brand/90"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-[13.5px] leading-relaxed text-ink-soft">
              Tell us which membership you need. We will invoice you and switch it on once the payment
              is received.
            </p>

            <label className="block space-y-1.5">
              <span className="block text-[12.5px] font-medium text-ink-soft">Membership</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className={fieldClass}>
                {REQUEST_TYPES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="block text-[12.5px] font-medium text-ink-soft">
                Anything we should know (optional)
              </span>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Your yard name, when you would like to start, billing details."
                className={`${fieldClass} h-auto py-2.5`}
              />
            </label>

            {error && <p className="text-[13px] text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-11 flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy}
                className="h-11 flex-1 rounded-xl bg-brand text-white hover:bg-brand/90"
              >
                {busy ? 'Sending…' : 'Send request'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}