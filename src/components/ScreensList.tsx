import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Monitor, Trash2 } from "lucide-react";
import { useScreens } from "@/hooks/useScreens";

export const ScreensList = () => {
  const { screens, addScreen, removeScreen } = useScreens();
  const [newScreenName, setNewScreenName] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddScreen = () => {
    if (newScreenName.trim()) {
      addScreen(newScreenName.trim());
      setNewScreenName("");
      setIsAddDialogOpen(false);
    }
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Connected Screens</Label>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="w-3 h-3 mr-1" />
                Add Screen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Screen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="screenName">Screen Name</Label>
                  <Input
                    id="screenName"
                    value={newScreenName}
                    onChange={(e) => setNewScreenName(e.target.value)}
                    placeholder="e.g., Studio Monitor 1"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddScreen()}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddScreen} disabled={!newScreenName.trim()}>
                    Add Screen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {screens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No screens connected</p>
              <p className="text-xs">Add a screen to start sharing</p>
            </div>
          ) : (
            screens.map((screen) => (
              <div
                key={screen.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{screen.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(screen.lastSeen).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={screen.connected ? "default" : "secondary"}>
                    {screen.connected ? "Connected" : "Offline"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeScreen(screen.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};