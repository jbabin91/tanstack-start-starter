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
} from '@/components/ui/chart/chart';

const meta: Meta<typeof ChartContainer> = {
  component: ChartContainer,
  decorators: [
    (Story) => (
      <div className="w-full max-w-4xl p-6">
        <Story />
      </div>
    ),
  ],
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
  title: 'UI/Data Display/Chart',
};

export default meta;
type Story = StoryObj<typeof ChartContainer>;

// Sample data for charts
const sampleData = [
  { desktop: 186, mobile: 80, month: 'Jan' },
  { desktop: 305, mobile: 200, month: 'Feb' },
  { desktop: 237, mobile: 120, month: 'Mar' },
  { desktop: 73, mobile: 190, month: 'Apr' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'Jun' },
  { desktop: 186, mobile: 180, month: 'Jul' },
  { desktop: 305, mobile: 220, month: 'Aug' },
  { desktop: 237, mobile: 160, month: 'Sep' },
  { desktop: 273, mobile: 290, month: 'Oct' },
  { desktop: 209, mobile: 230, month: 'Nov' },
  { desktop: 314, mobile: 340, month: 'Dec' },
];

const pieData = [
  { browser: 'chrome', fill: 'var(--color-chrome)', visitors: 275 },
  { browser: 'safari', fill: 'var(--color-safari)', visitors: 200 },
  { browser: 'firefox', fill: 'var(--color-firefox)', visitors: 187 },
  { browser: 'edge', fill: 'var(--color-edge)', visitors: 173 },
  { browser: 'other', fill: 'var(--color-other)', visitors: 90 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const pieChartConfig = {
  chrome: {
    label: 'Chrome',
    color: 'var(--chart-1)',
  },
  edge: {
    label: 'Edge',
    color: 'var(--chart-4)',
  },
  firefox: {
    label: 'Firefox',
    color: 'var(--chart-3)',
  },
  other: {
    label: 'Other',
    color: 'var(--chart-5)',
  },
  safari: {
    label: 'Safari',
    color: 'var(--chart-2)',
  },
  visitors: {
    label: 'Visitors',
  },
} satisfies ChartConfig;

export const LineChart_: Story = {
  args: {},
  name: 'Line Chart',
  parameters: {
    docs: {
      description: {
        story: 'Line chart showing desktop vs mobile traffic over time.',
      },
    },
  },
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
};

export const BarChart_: Story = {
  args: {},
  name: 'Bar Chart',
  parameters: {
    docs: {
      description: {
        story: 'Bar chart comparing desktop and mobile usage by month.',
      },
    },
  },
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
};

export const AreaChart_: Story = {
  args: {},
  name: 'Area Chart',
  parameters: {
    docs: {
      description: {
        story: 'Stacked area chart showing cumulative usage trends.',
      },
    },
  },
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
};

export const PieChart_: Story = {
  args: {},
  name: 'Pie Chart',
  parameters: {
    docs: {
      description: {
        story: 'Pie chart displaying browser usage distribution.',
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <ChartContainer className="size-[250px]" config={pieChartConfig}>
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
    </div>
  ),
};

export const WithLegend: Story = {
  args: {},
  name: 'With Legend',
  parameters: {
    docs: {
      description: {
        story: 'Bar chart with legend showing desktop vs mobile data.',
      },
    },
  },
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
};

export const WithIcons: Story = {
  args: {},
  name: 'With Icons',
  parameters: {
    docs: {
      description: {
        story: 'Chart with custom icons in legend and tooltip.',
      },
    },
  },
  render: () => {
    const configWithIcons = {
      desktop: {
        color: 'var(--chart-1)',
        icon: Icons.monitor,
        label: 'Desktop',
      },
      mobile: {
        color: 'var(--chart-2)',
        icon: Icons.smartphone,
        label: 'Mobile',
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
};

export const CustomTooltip: Story = {
  args: {},
  name: 'Custom Tooltip',
  parameters: {
    docs: {
      description: {
        story: 'Chart with custom tooltip formatting and styling.',
      },
    },
  },
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
};

export const MultipleDataSets: Story = {
  args: {},
  name: 'Multiple Data Sets',
  parameters: {
    docs: {
      description: {
        story: 'Area chart with three data sets: desktop, mobile, and tablet.',
      },
    },
  },
  render: () => {
    const multiData = [
      { desktop: 186, mobile: 80, month: 'Jan', tablet: 120 },
      { desktop: 305, mobile: 200, month: 'Feb', tablet: 180 },
      { desktop: 237, mobile: 120, month: 'Mar', tablet: 150 },
      { desktop: 73, mobile: 190, month: 'Apr', tablet: 100 },
      { desktop: 209, mobile: 130, month: 'May', tablet: 160 },
      { desktop: 214, mobile: 140, month: 'Jun', tablet: 170 },
    ];

    const multiConfig = {
      desktop: {
        label: 'Desktop',
        color: 'var(--chart-1)',
      },
      mobile: {
        label: 'Mobile',
        color: 'var(--chart-2)',
      },
      tablet: {
        label: 'Tablet',
        color: 'var(--chart-3)',
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
};

export const SmallChart: Story = {
  args: {},
  name: 'Small Chart',
  parameters: {
    docs: {
      description: {
        story: 'Small charts for dashboard widgets and KPI cards.',
      },
    },
  },
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <h3 className="font-medium">Desktop Users</h3>
        <ChartContainer
          className="h-[80px] w-full"
          config={{
            desktop: { label: 'Desktop', color: 'var(--chart-1)' },
          }}
        >
          <AreaChart
            data={sampleData.slice(0, 6)}
            margin={{ bottom: 5, left: 5, right: 5, top: 5 }}
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
            mobile: { label: 'Mobile', color: 'var(--chart-2)' },
          }}
        >
          <AreaChart
            data={sampleData.slice(0, 6)}
            margin={{ bottom: 5, left: 5, right: 5, top: 5 }}
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
            revenue: { label: 'Revenue', color: 'var(--chart-3)' },
          }}
        >
          <LineChart
            data={sampleData.slice(0, 6).map((item) => ({
              month: item.month,
              revenue: item.desktop + item.mobile,
            }))}
            margin={{ bottom: 5, left: 5, right: 5, top: 5 }}
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
            conversion: { label: 'Conversion', color: 'var(--chart-4)' },
          }}
        >
          <BarChart
            data={sampleData.slice(0, 6).map((item, index) => ({
              month: item.month,
              conversion: 2.5 + index * 0.2,
            }))}
            margin={{ bottom: 5, left: 5, right: 5, top: 5 }}
          >
            <Bar dataKey="conversion" fill="var(--color-conversion)" />
          </BarChart>
        </ChartContainer>
        <p className="text-muted-foreground text-sm">+2.1% from last month</p>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {},
  name: 'Interactive Dashboard',
  parameters: {
    docs: {
      description: {
        story:
          'Interactive dashboard showcasing multiple chart types with tooltips and legends.',
      },
    },
  },
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
};
