import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockInitialState } from '@/test/test-data';
import { useNameStore } from '../stores/useNameStore';
import { Footer } from './Footer';

describe('Footer', () => {
  beforeEach(() => {
    useNameStore.setState(mockInitialState);
  });

  it('renders normally with cyan theme', () => {
    render(<Footer />);

    expect(screen.getByText('Wilson Faustino')).toBeInTheDocument();
    expect(screen.getByText(/Created with/)).toBeInTheDocument();
    expect(screen.getByText(/Project on/)).toBeInTheDocument();
  });

  it('renders normally with sunset theme', () => {
    useNameStore.setState({
      ...mockInitialState,
      currentTheme: 'sunset',
    });

    render(<Footer />);

    expect(screen.getByText('Wilson Faustino')).toBeInTheDocument();
    // Should not have GlitchText layers (only plain text)
    const authorLink = screen.getByText('Wilson Faustino').closest('a');
    expect(authorLink).not.toHaveAttribute('aria-hidden');
  });

  it('applies glitch effect with matrix theme', () => {
    useNameStore.setState({
      ...mockInitialState,
      currentTheme: 'matrix',
    });

    render(<Footer />);

    // With GlitchText, there should be 3 spans: main + 2 glitch layers
    // Use queryAllByText since GlitchText renders 3 copies of the text
    const authorElements = screen.queryAllByText('Wilson Faustino');
    expect(authorElements.length).toBe(3);

    // Check for aria-hidden glitch layers (2 out of 3 should be aria-hidden)
    const hiddenSpans = authorElements.filter((el) => el.getAttribute('aria-hidden') === 'true');
    expect(hiddenSpans.length).toBe(2);

    // The first (visible) span should not be aria-hidden
    expect(authorElements[0].getAttribute('aria-hidden')).toBeNull();
  });

  it('keeps links clickable with glitch effect', async () => {
    const user = userEvent.setup();
    useNameStore.setState({
      ...mockInitialState,
      currentTheme: 'matrix',
    });

    render(<Footer />);

    // Use getAllByText and get the first (visible) element's parent link
    const authorElements = screen.getAllByText('Wilson Faustino');
    const authorLink = authorElements[0].closest('a');

    expect(authorLink).toHaveAttribute('href', 'https://github.com/wilsonfaustino');
    expect(authorLink).toHaveAttribute('target', '_blank');
    expect(authorLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Click should work normally
    await user.click(authorLink!);
    // No error means click was successful
  });

  it('renders authorName constant value', () => {
    render(<Footer />);

    // Verify the exact text content matches the constant
    const authorElement = screen.getByText('Wilson Faustino');
    expect(authorElement.textContent).toBe('Wilson Faustino');
  });

  it('renders GitHub project link', () => {
    render(<Footer />);

    const githubLink = screen.getByText('Github').closest('a');
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/wilsonfaustino/solar-wheel-of-fortune'
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
