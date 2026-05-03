import { useState } from "react";
import { Plus, BookOpen, Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useJournal } from "@/contexts/JournalContext";

const moodEmojis = ['😔', '😕', '😐', '🙂', '😊'];

const Journal = () => {
  const { entries, createEntry } = useJournal();
  const [newEntry, setNewEntry] = useState('');
  const [mood, setMood] = useState<number | undefined>(undefined);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(date));

  const handleSave = async () => {
    if (!newEntry.trim()) return;
    await createEntry({ content: newEntry.trim(), mood, tags: [] });
    setNewEntry('');
    setMood(undefined);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Evolution Journal</h1>
          <p className="text-muted-foreground">Document your journey and reflections</p>
        </div>
      </div>

      <Card variant="glow">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Quick Entry</span>
            <span className="text-xs text-muted-foreground">• Today</span>
          </div>
          <Textarea
            placeholder="What's on your mind today? Reflect on your progress, challenges, or insights..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[100px] resize-none bg-background/50 border-border/50"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Mood:</span>
              <div className="flex gap-1">
                {moodEmojis.map((emoji, i) => (
                  <button
                    key={i}
                    onClick={() => setMood(i + 1)}
                    className={`h-7 w-7 rounded-full hover:bg-secondary transition-colors text-lg ${mood === i + 1 ? 'bg-secondary' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <Button size="sm" onClick={handleSave} disabled={!newEntry.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Save Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Past Entries</h2>

        {entries.map((entry) => (
          <Card key={entry.id} variant="interactive" className="group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(entry.date)}</span>
                  {entry.mood && <span className="text-lg">{moodEmojis[entry.mood - 1]}</span>}
                </div>
              </div>
              {entry.title && (
                <h3 className="text-base font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                  {entry.title}
                </h3>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{entry.content}</p>
              {entry.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No entries yet</p>
              <p className="text-xs text-muted-foreground">Start documenting your journey above</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Journal;
