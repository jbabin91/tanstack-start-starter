import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';

import { Icons } from '@/components/icons';

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from './chart';

const meta: Meta<typeof ChartContainer> = {
  title: 'UI/Data Display/Chart',
  component: ChartContainer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible chart component built on top of Recharts with customizable theming, tooltips, and legends.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl p-6">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ChartContainer>;

// Sample data for charts
const sampleData = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
  { month: 'Jul', desktop: 186, mobile: 180 },
  { month: 'Aug', desktop: 305, mobile: 220 },
  { month: 'Sep', desktop: 237, mobile: 160 },
  { month: 'Oct', desktop: 273, mobile: 290 },
  { month: 'Nov', desktop: 209, mobile: 230 },
  { month: 'Dec', desktop: 314, mobile: 340 },
];

const pieData = [
  { browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
  { browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
  { browser: 'firefox', visitors: 187, fill: 'var(--color-firefox)' },
  { browser: 'edge', visitors: 173, fill: 'var(--color-edge)' },
  { browser: 'other', visitors: 90, fill: 'var(--color-other)' },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const pieChartConfig = {
  visitors: {
    label: 'Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))',
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))',
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export const LineChart_: Story = {
  name: 'Line Chart',
  render: () => (
    <ChartContainer className="h-[200px] w-full" config={chartConfig}>
      <LineChart accessibilityLayer data={sampleData}>
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          dataKey="desktop"
          dot={false}
          stroke="var(--color-desktop)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="mobile"
          dot={false}
          stroke="var(--color-mobile)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Line chart showing desktop vs mobile traffic over time.',
      },
    },
  },
};

export const BarChart_: Story = {
  name: 'Bar Chart',
  render: () => (
    <ChartContainer className="h-[200px] w-full" config={chartConfig}>
      <BarChart accessibilityLayer data={sampleData}>
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Bar chart comparing desktop and mobile usage by month.',
      },
    },
  },
};

export const AreaChart_: Story = {
  name: 'Area Chart',
  render: () => (
    <ChartContainer className="h-[200px] w-full" config={chartConfig}>
      <AreaChart accessibilityLayer data={sampleData}>
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="mobile"
          fill="var(--color-mobile)"
          fillOpacity={0.6}
          stackId="1"
          stroke="var(--color-mobile)"
          strokeWidth={2}
          type="monotone"
        />
        <Area
          dataKey="desktop"
          fill="var(--color-desktop)"
          fillOpacity={0.6}
          stackId="1"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Stacked area chart showing cumulative usage trends.',
      },
    },
  },
};

export const PieChart_: Story = {
  name: 'Pie Chart',
  render: () => (
    <ChartContainer
      className="mx-auto aspect-square max-h-[250px]"
      config={pieChartConfig}
    >
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="visitors" />}
          cursor={false}
        />
        <Pie
          cx="50%"
          cy="50%"
          data={pieData}
          dataKey="visitors"
          innerRadius={60}
          nameKey="browser"
          outerRadius={80}
          strokeWidth={5}
        />
      </PieChart>
    </ChartContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pie chart displaying browser usage distribution.',
      },
    },
  },
};

export const WithLegend: Story = {
  render: () => (
    <ChartContainer className="h-[300px] w-full" config={chartConfig}>
      <BarChart accessibilityLayer data={sampleData} margin={{ bottom: 50 }}>
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Bar chart with legend showing desktop vs mobile data.',
      },
    },
  },
};

export const WithIcons: Story = {
  render: () => {
    const configWithIcons = {
      desktop: {
        label: 'Desktop',
        color: 'hsl(var(--chart-1))',
        icon: Icons.monitor,
      },
      mobile: {
        label: 'Mobile',
        color: 'hsl(var(--chart-2))',
        icon: Icons.smartphone,
      },
    } satisfies ChartConfig;

    return (
      <ChartContainer className="h-[300px] w-full" config={configWithIcons}>
        <BarChart accessibilityLayer data={sampleData} margin={{ bottom: 50 }}>
          <XAxis
            axisLine={false}
            dataKey="month"
            tickFormatter={(value) => value.slice(0, 3)}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
          <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
        </BarChart>
      </ChartContainer>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart with custom icons in legend and tooltip.',
      },
    },
  },
};

export const CustomTooltip: Story = {
  render: () => (
    <ChartContainer className="h-[200px] w-full" config={chartConfig}>
      <LineChart accessibilityLayer data={sampleData}>
        <XAxis
          axisLine={false}
          dataKey="month"
          tickFormatter={(value) => value.slice(0, 3)}
          tickLine={false}
          tickMargin={8}
        />
        <YAxis axisLine={false} tickLine={false} tickMargin={8} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="text-muted-foreground flex min-w-[130px] items-center text-xs">
                  {name}:
                  <div className="text-foreground ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums">
                    {value}
                    <span className="text-muted-foreground font-normal">
                      users
                    </span>
                  </div>
                </div>
              )}
              indicator="line"
              labelKey="month"
            />
          }
        />
        <Line
          dataKey="desktop"
          dot={false}
          stroke="var(--color-desktop)"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="mobile"
          dot={false}
          stroke="var(--color-mobile)"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ChartContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Chart with custom tooltip formatting and styling.',
      },
    },
  },
};

export const MultipleDataSets: Story = {
  render: () => {
    const multiData = [
      { month: 'Jan', desktop: 186, mobile: 80, tablet: 120 },
      { month: 'Feb', desktop: 305, mobile: 200, tablet: 180 },
      { month: 'Mar', desktop: 237, mobile: 120, tablet: 150 },
      { month: 'Apr', desktop: 73, mobile: 190, tablet: 100 },
      { month: 'May', desktop: 209, mobile: 130, tablet: 160 },
      { month: 'Jun', desktop: 214, mobile: 140, tablet: 170 },
    ];

    const multiConfig = {
      desktop: {
        label: 'Desktop',
        color: 'hsl(var(--chart-1))',
      },
      mobile: {
        label: 'Mobile',
        color: 'hsl(var(--chart-2))',
      },
      tablet: {
        label: 'Tablet',
        color: 'hsl(var(--chart-3))',
      },
    } satisfies ChartConfig;

    return (
      <ChartContainer className="h-[300px] w-full" config={multiConfig}>
        <AreaChart accessibilityLayer data={multiData} margin={{ bottom: 50 }}>
          <XAxis
            axisLine={false}
            dataKey="month"
            tickFormatter={(value) => value.slice(0, 3)}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis axisLine={false} tickLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            dataKey="tablet"
            fill="var(--color-tablet)"
            fillOpacity={0.6}
            stackId="1"
            stroke="var(--color-tablet)"
            strokeWidth={2}
            type="monotone"
          />
          <Area
            dataKey="mobile"
            fill="var(--color-mobile)"
            fillOpacity={0.6}
            stackId="1"
            stroke="var(--color-mobile)"
            strokeWidth={2}
            type="monotone"
          />
          <Area
            dataKey="desktop"
            fill="var(--color-desktop)"
            fillOpacity={0.6}
            stackId="1"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Area chart with three data sets: desktop, mobile, and tablet.',
      },
    },
  },
};

export const SmallChart: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <h3 className="font-medium">Desktop Users</h3>
        <ChartContainer
          className="h-[80px] w-full"
          config={{
            desktop: { label: 'Desktop', color: 'hsl(var(--chart-1))' },
          }}
        >
          <AreaChart
            data={sampleData.slice(0, 6)}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <Area
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
              stroke="var(--color-desktop)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
        <p className="text-muted-foreground text-sm">+12% from last month</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Mobile Users</h3>
        <ChartContainer
          className="h-[80px] w-full"
          config={{
            mobile: { label: 'Mobile', color: 'hsl(var(--chart-2))' },
          }}
        >
          <AreaChart
            data={sampleData.slice(0, 6)}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <Area
              dataKey="mobile"
              fill="var(--color-mobile)"
              fillOpacity={0.6}
              stroke="var(--color-mobile)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
        <p className="text-muted-foreground text-sm">+8% from last month</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Total Revenue</h3>
        <ChartContainer
          className="h-[80px] w-full"
          config={{
            revenue: { label: 'Revenue', color: 'hsl(var(--chart-3))' },
          }}
        >
          <LineChart
            data={sampleData.slice(0, 6).map((item) => ({
              month: item.month,
              revenue: item.desktop + item.mobile,
            }))}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <Line
              dataKey="revenue"
              dot={false}
              stroke="var(--color-revenue)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ChartContainer>
        <p className="text-muted-foreground text-sm">+15% from last month</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Conversion Rate</h3>
        <ChartContainer
          className="h-[80px] w-full"
          config={{
            conversion: { label: 'Conversion', color: 'hsl(var(--chart-4))' },
          }}
        >
          <BarChart
            data={sampleData.slice(0, 6).map((item, index) => ({
              month: item.month,
              conversion: 2.5 + index * 0.2,
            }))}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <Bar dataKey="conversion" fill="var(--color-conversion)" />
          </BarChart>
        </ChartContainer>
        <p className="text-muted-foreground text-sm">+2.1% from last month</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Small charts for dashboard widgets and KPI cards.',
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-2xl font-bold">Analytics Dashboard</h2>
        <ChartContainer className="h-[300px] w-full" config={chartConfig}>
          <AreaChart accessibilityLayer data={sampleData}>
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="mobile"
              fill="var(--color-mobile)"
              fillOpacity={0.6}
              stackId="1"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              type="monotone"
            />
            <Area
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.6}
              stackId="1"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Browser Usage</h3>
          <ChartContainer
            className="mx-auto aspect-square max-h-[200px]"
            config={pieChartConfig}
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="visitors" />}
                cursor={false}
              />
              <Pie
                cx="50%"
                cy="50%"
                data={pieData}
                dataKey="visitors"
                innerRadius={40}
                nameKey="browser"
                outerRadius={60}
                strokeWidth={5}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Monthly Comparison</h3>
          <ChartContainer className="h-[200px] w-full" config={chartConfig}>
            <BarChart accessibilityLayer data={sampleData.slice(0, 6)}>
              <XAxis
                axisLine={false}
                dataKey="month"
                tickFormatter={(value) => value.slice(0, 3)}
                tickLine={false}
                tickMargin={8}
              />
              <YAxis axisLine={false} tickLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
              <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify chart container is present
    const chartContainer = canvasElement.querySelector('[data-slot="chart"]');
    expect(chartContainer).toBeInTheDocument();

    // Verify multiple charts are rendered
    const charts = canvasElement.querySelectorAll('[data-slot="chart"]');
    expect(charts.length).toBeGreaterThan(1);

    // Verify chart titles
    expect(canvas.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(canvas.getByText('Browser Usage')).toBeInTheDocument();
    expect(canvas.getByText('Monthly Comparison')).toBeInTheDocument();

    // Test tooltip interaction by finding a chart area and hovering
    const chartAreas = canvasElement.querySelectorAll('svg');
    expect(chartAreas.length).toBeGreaterThan(0);

    // Test basic chart structure
    if (chartAreas[0]) {
      await userEvent.hover(chartAreas[0]);
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive dashboard showcasing multiple chart types with tooltips and legends.',
      },
    },
  },
};
