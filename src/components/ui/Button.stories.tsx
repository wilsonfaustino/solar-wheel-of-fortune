import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['tech', 'tech-ghost', 'tech-destructive', 'tech-toggle', 'tech-outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'icon-sm', 'tech-default', 'tech-sm'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tech: Story = { args: { variant: 'tech', children: 'ADD NAME' } };
export const TechGhost: Story = { args: { variant: 'tech-ghost', children: 'CANCEL' } };
export const TechDestructive: Story = { args: { variant: 'tech-destructive', children: 'DELETE' } };
export const TechToggle: Story = { args: { variant: 'tech-toggle', children: 'OPTION' } };
export const TechOutline: Story = { args: { variant: 'tech-outline', children: 'CLOSE' } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <Button variant="tech">TECH PRIMARY</Button>
      <Button variant="tech-ghost">TECH GHOST</Button>
      <Button variant="tech-destructive">TECH DESTRUCTIVE</Button>
      <Button variant="tech-toggle">TECH TOGGLE</Button>
      <Button variant="tech-outline">TECH OUTLINE</Button>
    </div>
  ),
};
