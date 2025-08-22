import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Progress } from './progress';

const meta = {
  title: 'UI/Feedback/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A progress component built on Radix UI that displays the completion progress of a task, typically displayed as a progress bar. Supports WCAG AA accessibility standards.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[400px] space-y-4">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: {
      description: 'The progress value (0-100)',
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: {
        type: { summary: 'number | null | undefined' },
      },
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Full: Story = {
  args: {
    value: 100,
  },
};

export const Indeterminate: Story = {
  args: {
    value: undefined,
  },
};

export const WithCustomStyling: Story = {
  args: {
    value: 75,
    className: 'h-3',
  },
};

export const InteractiveDemo: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    const startProgress = () => {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Upload Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress
            aria-label={`Upload progress: ${progress}%`}
            value={progress}
          />
        </div>
        <Button size="sm" onClick={startProgress}>
          Start Upload
        </Button>
      </div>
    );
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify initial state
    const progressBar = canvas.getByRole('progressbar');
    expect(progressBar).toBeVisible();

    // Test button interaction
    const startButton = canvas.getByRole('button', { name: 'Start Upload' });
    expect(startButton).toBeVisible();

    // Verify accessibility label
    expect(progressBar).toHaveAttribute('aria-label', 'Upload progress: 0%');
  },
};

export const WithLabels: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Storage Used</span>
          <span>65%</span>
        </div>
        <Progress aria-label="Storage usage: 65%" value={65} />
        <p className="text-muted-foreground text-xs">8.5 GB of 13 GB used</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Download Progress</span>
          <span>33%</span>
        </div>
        <Progress aria-label="Download progress: 33%" value={33} />
        <p className="text-muted-foreground text-xs">
          Downloading update... (2.1 MB of 6.3 MB)
        </p>
      </div>
    </div>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify multiple progress bars are rendered
    const progressBars = canvas.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(2);

    // Verify accessibility labels
    expect(progressBars[0]).toHaveAttribute('aria-label', 'Storage usage: 65%');
    expect(progressBars[1]).toHaveAttribute(
      'aria-label',
      'Download progress: 33%',
    );

    // Verify descriptive text
    expect(canvas.getByText('8.5 GB of 13 GB used')).toBeVisible();
    expect(
      canvas.getByText('Downloading update... (2.1 MB of 6.3 MB)'),
    ).toBeVisible();
  },
};
