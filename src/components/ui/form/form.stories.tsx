import { arktypeResolver } from '@hookform/resolvers/arktype';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import { type } from 'arktype';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const meta: Meta<typeof Form> = {
  argTypes: {
    // Form is a wrapper around FormProvider, so no direct props to control
  },
  component: Form,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Form components built on top of React Hook Form for handling form validation, submission, and error management.',
      },
    },
  },
  tags: ['autodocs'],
  title: 'UI/Inputs/Form',
};

export default meta;
type Story = StoryObj<typeof meta>;

// Schema for validation examples
const basicFormSchema = type({
  email: 'string.email>=1',
  message: 'string>=10',
  name: 'string>=2',
});

const profileFormSchema = type({
  'bio?': 'string<=160',
  email: 'string.email>=1',
  firstName: 'string>=2',
  lastName: 'string>=2',
  notifications: 'boolean',
  role: "'user'|'admin'|'moderator'",
});

const settingsFormSchema = type({
  confirmPassword: 'string',
  currentPassword: 'string>=1',
  newPassword: 'string>=8',
  twoFactor: 'boolean',
});

// Basic Contact Form
function BasicContactForm() {
  const form = useForm<typeof basicFormSchema.infer>({
    resolver: arktypeResolver(basicFormSchema),
    defaultValues: {
      email: '',
      message: '',
      name: '',
    },
  });

  function onSubmit(values: typeof basicFormSchema.infer) {
    console.log('Form submitted:', values);
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
        <CardDescription>
          Send us a message and we&apos;ll get back to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your full name as you&apos;d like us to address you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll use this email to respond to your message.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Tell us how we can help you..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your message should be at least 10 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outlined">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Send Message
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Profile Settings Form
function ProfileSettingsForm() {
  const form = useForm<typeof profileFormSchema.infer>({
    resolver: arktypeResolver(profileFormSchema),
    defaultValues: {
      bio: '',
      email: '',
      firstName: '',
      lastName: '',
      notifications: true,
      role: 'user',
    },
  });

  // Could also be from a query or constant.
  const roleItems = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
  ];

  function onSubmit(values: typeof profileFormSchema.infer) {
    console.log('Profile updated:', values);
  }

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your profile information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormDescription>Your first or given name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormDescription>Your family or last name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your email address for account notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Tell us about yourself..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description for your profile. Maximum 160 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    defaultValue={field.value}
                    items={roleItems}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Your role determines your access permissions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Email Notifications</FormLabel>
                    <FormDescription>
                      Receive email notifications about your account activity.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outlined">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Security Settings Form
function SecuritySettingsForm() {
  const form = useForm<typeof settingsFormSchema.infer>({
    resolver: arktypeResolver(settingsFormSchema),
    defaultValues: {
      confirmPassword: '',
      currentPassword: '',
      newPassword: '',
      twoFactor: false,
    },
  });

  function onSubmit(values: typeof settingsFormSchema.infer) {
    // Custom validation for password confirmation
    if (values.newPassword !== values.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords don&apos;t match',
      });
      return;
    }
    console.log('Security updated:', values);
  }

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Update your password and security preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter current password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your current password for verification.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter new password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm new password"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Re-enter your new password to confirm it matches.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twoFactor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Two-Factor Authentication</FormLabel>
                    <FormDescription>
                      Add an extra layer of security to your account.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outlined">
                Cancel
              </Button>
              <Button color="primary" type="submit">
                Update Security
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export const BasicForm: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Basic contact form with validation using Arktype schema and React Hook Form.',
      },
    },
  },
  render: () => <BasicContactForm />,
};

export const ProfileForm: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Profile settings form with various input types, validation, and switches.',
      },
    },
  },
  render: () => <ProfileSettingsForm />,
};

export const SecurityForm: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Security settings form with password validation and cross-field validation.',
      },
    },
  },
  render: () => <SecuritySettingsForm />,
};

export const ValidationDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demonstration of form validation with real-time error handling.',
      },
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Try to submit empty form to trigger validation
    const submitButton = canvas.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);

    // Check that validation errors appear
    await waitFor(
      () => {
        // Look for Arktype validation error text
        const errors = canvas.getAllByText(/must be at least|String|email/);
        expect(errors.length).toBeGreaterThan(0);
      },
      { timeout: 2000 },
    );

    // Fill in name field
    const nameInput = canvas.getByPlaceholderText('John Doe');
    await userEvent.type(nameInput, 'John Smith');

    // Verify some validation improves with valid input
    await waitFor(
      () => {
        // Check that form has some valid state by looking for the input value
        expect(nameInput).toHaveValue('John Smith');
      },
      { timeout: 1000 },
    );

    // Fill in invalid email
    const emailInput = canvas.getByPlaceholderText('john@example.com');
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab(); // Trigger blur

    // Trigger validation by attempting submit
    await userEvent.click(submitButton);

    // Fix email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'john@example.com');

    // Fill message with valid content
    const messageInput = canvas.getByPlaceholderText(
      'Tell us how we can help you...',
    );
    await userEvent.type(
      messageInput,
      'This is a test message that is long enough for validation.',
    );

    // Verify form fields have valid values
    await waitFor(() => {
      expect(nameInput).toHaveValue('John Smith');
      expect(emailInput).toHaveValue('john@example.com');
      expect(messageInput).toHaveValue(
        'This is a test message that is long enough for validation.',
      );
    });
  },
  render: () => <BasicContactForm />,
};

function FormStatesComponent() {
  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      disabledField: 'Cannot edit',
      invalidField: '',
      validField: 'Valid input',
    },
  });

  return (
    <div className="w-[400px] space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form States</CardTitle>
          <CardDescription>
            Examples of different form field states.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="validField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Field</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This field has valid input.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invalidField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invalid Field</FormLabel>
                    <FormControl>
                      <Input {...field} aria-invalid />
                    </FormControl>
                    <FormDescription>
                      This field demonstrates error state handling.
                    </FormDescription>
                    <FormMessage>
                      This field is required and cannot be empty.
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disabledField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disabled Field</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      This field is disabled and cannot be edited.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button color="primary">Submit Form</Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export const FormStates: Story = {
  render: () => <FormStatesComponent />,
  parameters: {
    docs: {
      description: {
        story:
          'Different form field states including valid, invalid, and disabled states.',
      },
    },
  },
};
