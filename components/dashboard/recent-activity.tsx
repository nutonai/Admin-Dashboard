"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ActivityItem = {
  id: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  type: "signup" | "payment";
  amount?: number;
  date: string;
};

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    user: {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
    },
    type: "payment",
    amount: 1999.00,
    date: "Just now"
  },
  {
    id: "2",
    user: {
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
    },
    type: "signup",
    date: "2 minutes ago"
  },
  {
    id: "3",
    user: {
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
    },
    type: "payment",
    amount: 299.00,
    date: "3 hours ago"
  },
  {
    id: "4",
    user: {
      name: "William Kim",
      email: "will@email.com",
    },
    type: "payment",
    amount: 99.00,
    date: "5 hours ago"
  },
  {
    id: "5",
    user: {
      name: "Sofia Davis",
      email: "sofia.davis@email.com",
    },
    type: "signup",
    date: "1 day ago"
  }
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {recentActivity.map((item) => (
        <div key={item.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={item.user.image} alt={item.user.name} />
            <AvatarFallback>
              {item.user.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{item.user.name}</p>
            <p className="text-sm text-muted-foreground">{item.user.email}</p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            {item.type === "payment" && (
              <span className="font-medium">+${item.amount?.toFixed(2)}</span>
            )}
            <Badge variant={item.type === "signup" ? "outline" : "secondary"}>
              {item.type === "signup" ? "New Sign-up" : "Payment"}
            </Badge>
          </div>
          <div className="ml-4 text-xs text-muted-foreground w-24 text-right">
            {item.date}
          </div>
        </div>
      ))}
    </div>
  );
}