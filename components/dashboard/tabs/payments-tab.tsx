"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, DonutChart } from "@/components/ui/chart";

type Transaction = {
  id: string;
  user: {
    name: string;
    email: string;
  };
  amount: number;
  status: "Completed" | "Processing" | "Failed";
  date: string;
  plan: "Starter" | "Pro" | "Ultra";
};

const transactions: Transaction[] = [
  {
    id: "t_1",
    user: {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
    },
    amount: 1999.00,
    status: "Completed",
    date: "2023-09-01",
    plan: "Pro",
  },
  {
    id: "t_2",
    user: {
      name: "Isabella Nguyen",
      email: "isabella.nguyen@email.com",
    },
    amount: 299.00,
    status: "Completed",
    date: "2023-09-02",
    plan: "Ultra",
  },
  {
    id: "t_3",
    user: {
      name: "William Kim",
      email: "will@email.com",
    },
    amount: 99.00,
    status: "Processing",
    date: "2023-09-03",
    plan: "Pro",
  },
  {
    id: "t_4",
    user: {
      name: "Ethan Johnson",
      email: "ethan.johnson@email.com",
    },
    amount: 299.00,
    status: "Completed",
    date: "2023-09-04",
    plan: "Ultra",
  },
  {
    id: "t_5",
    user: {
      name: "Noah Brown",
      email: "noah.brown@email.com",
    },
    amount: 49.00,
    status: "Failed",
    date: "2023-09-05",
    plan: "Starter",
  },
];

const planRevenueData = [
  { name: "Starter", value: 12500 },
  { name: "Pro", value: 25750 },
  { name: "Ultra", value: 6981.89 },
];

const paymentStatusData = [
  { name: "Completed", value: 78 },
  { name: "Processing", value: 15 },
  { name: "Failed", value: 7 },
];

export function PaymentsTab() {
  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Processing":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "Failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "";
    }
  };

  const getPlanColor = (plan: Transaction["plan"]) => {
    switch (plan) {
      case "Starter":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "Pro":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "Ultra":
        return "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>
              Distribution of revenue across different subscription plans
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DonutChart
              data={planRevenueData}
              index="name"
              category="value"
              valueFormatter={(value) => `$${value.toLocaleString()}`}
              colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"]}
              className="h-80"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Distribution</CardTitle>
            <CardDescription>
              Overview of payment statuses across all transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChart
              data={paymentStatusData}
              index="name"
              categories={["value"]}
              colors={["chart-4"]}
              valueFormatter={(value) => `${value}%`}
              yAxisWidth={48}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest payment transactions on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={transaction.user.name} />
                        <AvatarFallback>
                          {transaction.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {transaction.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {transaction.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getPlanColor(transaction.plan)}
                    >
                      {transaction.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(transaction.status)}
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}