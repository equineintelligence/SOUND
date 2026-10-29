import LegalShell from '@/components/LegalShell';
import RosetteColourKey from '@/components/RosetteColourKey';

export default function HowRosettesWork() {
  return (
    <LegalShell title="How rosettes work" updated="23 October 2026">
      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What a rosette means</h2>
        <p>
          A rosette is the badge a business wears on Sound, and its colour shows at a glance how
          riders rate it. It is earned the same way a horse stays sound: doing the basics well,
          consistently, and being reliable to deal with.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">The criteria</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Horse care rosette: the average of a business's horse care scores.</li>
          <li>Coaching rosette: the average of its communication scores.</li>
          <li>Service rosette: the average of its professionalism scores.</li>
          <li>
            A rosette appears from the business's first verified review, and is re-checked against
            reviews from the past 12 months.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What the colours mean</h2>
        <p>The rosette takes its colour from the score it stands for, the way a show ring does.</p>
        <RosetteColourKey />
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">How they are awarded</h2>
        <p>
          Rosettes are calculated automatically from published reviews only. Nothing is entered by
          hand and nothing about them can be bought. They are re-checked every month, and withdrawn
          if the criteria are no longer met.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-[17px] font-semibold text-ink">What they are not</h2>
        <p>
          A rosette is not a guarantee, a certification or an endorsement, and it is never sold,
          sponsored or influenced by payment. A free listing gives no control over ratings or
          rosettes.
        </p>
      </section>
    </LegalShell>
  );
}