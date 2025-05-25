import { render, screen } from '@testing-library/react';
import { Button } from './button'; // Adjust the import path as necessary

describe('Button Component', () => {
  it('renders the button with the correct text', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /Click Me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies default variant and size classes when not specified', () => {
    render(<Button>Default Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Default Button/i });
    // Check for a class that is part of the default variant and size
    // This might need adjustment based on the exact classes applied by cva
    expect(buttonElement).toHaveClass('bg-primary');
    expect(buttonElement).toHaveClass('h-10');
  });

  it('applies specified variant and size classes', () => {
    render(<Button variant="destructive" size="sm">Small Destructive</Button>);
    const buttonElement = screen.getByRole('button', { name: /Small Destructive/i });
    expect(buttonElement).toHaveClass('bg-destructive'); // From destructive variant
    expect(buttonElement).toHaveClass('h-9'); // From sm size
  });

  it('renders as a child component when asChild prop is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    // Check if the element is an anchor tag, not a button
    const linkElement = screen.getByRole('link', { name: /Link Button/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    // Check for button classes still being applied
    expect(linkElement).toHaveClass('bg-primary');
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Disabled Button/i });
    expect(buttonElement).toBeDisabled();
    expect(buttonElement).toHaveClass('disabled:opacity-50');
  });
});
