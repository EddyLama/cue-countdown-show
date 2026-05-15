import { useLiveDeck } from "@/stores/liveDeckStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";

const Analytics = () => {
  const { trainer, session, rundown } = useLiveDeck();

  const events = session.recording;
  const errorTypes = ["challenge", "error"] as const;
  const errorCount = events.filter((e) => errorTypes.includes(e.type as any)).length;
  const takeCount = events.filter((e) => e.type === "take" || e.type === "cut").length;

  // Heatmap: cue × event type matrix
  const cueIds = rundown.cues.map((c) => c.id);
  const heatmap: Record<string, number> = {};
  events.forEach((e) => {
    const k = `${(e.type)}`;
    heatmap[k] = (heatmap[k] ?? 0) + 1;
  });

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("LiveDeck Pro — Session Report", 14, 18);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    doc.text(`Score: ${trainer.score.value}`, 14, 38);
    doc.text(`Takes: ${trainer.score.takes}`, 14, 46);
    doc.text(`Errors: ${trainer.score.errors}`, 14, 54);
    doc.text(`Cues completed: ${rundown.cues.filter((c) => c.done).length}/${rundown.cues.length}`, 14, 62);

    doc.text("Event log:", 14, 76);
    let y = 84;
    events.slice(0, 50).forEach((e) => {
      doc.setFontSize(9);
      doc.text(`${(e.t / 1000).toFixed(1)}s [${e.type}] ${e.message}`.slice(0, 90), 14, y);
      y += 6;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save("livedeck-session.pdf");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics &amp; Session Replay</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Score, mistake heatmap, and full timeline of decisions.
          </p>
        </div>
        <Button onClick={exportPdf} className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Score", v: trainer.score.value, c: "text-cue" },
          { l: "Takes", v: takeCount, c: "text-preview" },
          { l: "Errors", v: errorCount, c: "text-program" },
          { l: "Events", v: events.length, c: "text-trainer" },
        ].map((s) => (
          <Card key={s.l} className="p-4 bg-panel border-border text-center">
            <div className={`font-mono text-3xl font-bold ${s.c}`}>{s.v}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1.5">{s.l}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 bg-panel border-border">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Event Heatmap</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(heatmap).map(([k, v]) => (
            <div key={k} className="bg-secondary/50 border border-border rounded-md p-3">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{k}</div>
              <div
                className="mt-2 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, v * 8)}%`,
                  background: "linear-gradient(90deg,hsl(var(--preview)),hsl(var(--cue)),hsl(var(--program)))",
                }}
              />
              <div className="text-xs font-mono mt-1">{v}</div>
            </div>
          ))}
          {Object.keys(heatmap).length === 0 && (
            <div className="text-xs text-muted-foreground col-span-full text-center py-6">
              No events recorded yet.
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5 bg-panel border-border">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Timeline</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {events.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">Run a session in LiveDeck to populate the timeline.</div>
          )}
          {events.map((e) => (
            <div key={e.id} className="flex items-baseline gap-3 py-1 border-b border-border/40 text-xs">
              <span className="font-mono text-muted-foreground w-16 shrink-0">{(e.t / 1000).toFixed(1)}s</span>
              <span className="font-bold text-[10px] uppercase tracking-wider w-24 shrink-0 text-trainer">{e.type}</span>
              <span className="flex-1">{e.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
