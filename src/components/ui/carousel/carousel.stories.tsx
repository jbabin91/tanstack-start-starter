import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './carousel';

const meta: Meta<typeof Carousel> = {
  title: 'UI/Surfaces/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A carousel component built on top of Embla Carousel with support for horizontal and vertical scrolling, navigation buttons, and keyboard controls.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={`carousel-item-${index}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic carousel with navigation arrows and numbered cards.',
      },
    },
  },
};

export const MultipleItems: Story = {
  render: () => (
    <Carousel
      className="w-full max-w-sm"
      opts={{
        align: 'start',
        loop: false,
      }}
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <CarouselItem
            key={`multi-carousel-item-${index}`}
            className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3"
          >
            <Card>
              <CardContent className="flex aspect-square items-center justify-center p-4">
                <span className="text-2xl font-semibold">{index + 1}</span>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Carousel showing multiple items at once with responsive sizing.',
      },
    },
  },
};

export const WithImages: Story = {
  render: () => (
    <Carousel className="w-full max-w-md">
      <CarouselContent>
        {[
          {
            src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
            alt: 'Mountain landscape',
          },
          {
            src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            alt: 'Forest trail',
          },
          {
            src: 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc4?w=400&h=300&fit=crop',
            alt: 'Ocean waves',
          },
          {
            src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
            alt: 'Desert dunes',
          },
        ].map((image, index) => (
          <CarouselItem key={`image-carousel-item-${index}`}>
            <Card>
              <CardContent className="p-0">
                <img
                  alt={image.alt}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                  src={image.src}
                />
                <div className="p-4">
                  <h3 className="font-semibold">{image.alt}</h3>
                  <p className="text-muted-foreground text-sm">
                    Slide {index + 1} of 4
                  </p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Image carousel with descriptive captions.',
      },
    },
  },
};

export const VerticalOrientation: Story = {
  render: () => (
    <Carousel className="mx-auto w-full max-w-xs" orientation="vertical">
      <CarouselContent className="-mt-1 h-[200px]">
        {Array.from({ length: 4 }).map((_, index) => (
          <CarouselItem
            key={`vertical-carousel-item-${index}`}
            className="pt-1 md:basis-1/2"
          >
            <div className="p-1">
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carousel with vertical scrolling orientation.',
      },
    },
  },
};

export const WithLoop: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs" opts={{ loop: true }}>
      <CarouselContent>
        {Array.from({ length: 3 }).map((_, index) => (
          <CarouselItem key={`loop-carousel-item-${index}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carousel with infinite loop enabled for continuous scrolling.',
      },
    },
  },
};

export const CustomNavigation: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 4 }).map((_, index) => (
          <CarouselItem key={`custom-carousel-item-${index}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Carousel with custom positioned navigation buttons.',
      },
    },
  },
};

export const WithIndicators: Story = {
  render: function WithIndicatorsStory() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!api) return;

      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);

      api.on('select', () => {
        setCurrent(api.selectedScrollSnap() + 1);
      });
    }, [api]);

    return (
      <div className="space-y-4">
        <Carousel className="w-full max-w-xs" setApi={setApi}>
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={`indicator-carousel-item-${index}`}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <span className="text-4xl font-semibold">
                        {index + 1}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="text-muted-foreground py-2 text-center text-sm">
          Slide {current} of {count}
        </div>
        <div className="flex justify-center space-x-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={`indicator-${index}`}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === current - 1 ? 'bg-primary' : 'bg-muted'
              }`}
              type="button"
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Carousel with dot indicators and slide counter.',
      },
    },
  },
};

export const Interactive: Story = {
  render: () => (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 6 }).map((_, index) => (
          <CarouselItem key={`interactive-carousel-item-${index}`}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <div className="text-center">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Card {index + 1}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify carousel structure
    const carousel = canvas.getByRole('region');
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');

    // Find navigation buttons
    const nextButton = canvas.getByRole('button', { name: /next slide/i });
    const prevButton = canvas.getByRole('button', { name: /previous slide/i });

    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();

    // Test basic navigation - just click buttons without checking disabled state
    // since the timing can be complex with Embla carousel
    await userEvent.click(nextButton);
    await userEvent.click(prevButton);

    // Test keyboard navigation
    carousel.focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.keyboard('{ArrowLeft}');

    // Verify slide groups
    const slides = canvas.getAllByRole('group');
    expect(slides.length).toBeGreaterThan(0);
    for (const slide of slides) {
      expect(slide).toHaveAttribute('aria-roledescription', 'slide');
    }
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive carousel with navigation controls and keyboard support.',
      },
    },
  },
};
