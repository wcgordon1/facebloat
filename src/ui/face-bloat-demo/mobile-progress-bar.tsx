import { CheckCircle2 } from 'lucide-react';

export function MobileProgressBar() {
  return (
    <div className="md:hidden bg-background border-t border-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-foreground">75% Complete</span>
        </div>
        <div className="text-sm text-muted-foreground">Just signup needed</div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: '75%' }}
        />
      </div>
    </div>
  );
}
