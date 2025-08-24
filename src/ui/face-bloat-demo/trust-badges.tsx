import { Shield, Users, Lock, Clock } from 'lucide-react';

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Shield className="h-3 w-3 text-green-600" />
        <span>256-bit SSL</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3 text-blue-600" />
        <span>2,000+ this month</span>
      </div>
      <div className="flex items-center gap-1">
        <Lock className="h-3 w-3 text-purple-600" />
        <span>Private & secure</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3 text-orange-600" />
        <span>2-min signup</span>
      </div>
    </div>
  );
}
