'use client';

import { useState, useEffect, useRef, memo, ReactNode } from 'react';

/**
 * AnimatedProgressSteps - Sequential Step Progress Indicator
 * 
 * A polished multi-step progress indicator with smooth animations between states.
 * Perfect for multi-stage processes like data loading, form wizards, or onboarding.
 * 
 * 2026 Design Trend: "Progressive Disclosure" - showing users where they are
 * in a process reduces anxiety and improves perceived performance. Sequential
 * step indicators with smooth transitions create a premium, trustworthy feel.
 * 
 * Inspiration:
 * - Linear's project creation flow
 * - Stripe checkout progress
 * - Vercel deployment steps
 * - Apple's setup assistant transitions
 * 
 * Features:
 * - Smooth step transitions with spring physics
 * - Icon morphing between states (circle → check → next)
 * - Progress line animation between steps
 * - Pulsing current step indicator
 * - Optional step descriptions
 * - Horizontal and vertical variants
 * - Light/dark mode aware
 * - Respects prefers-reduced-motion
 * - GPU-accelerated animations
 * 
 * @example
 * // Basic usage
 * <AnimatedProgressSteps
 *   steps={['Connect', 'Configure', 'Deploy']}
 *   currentStep={1}
 * />
 * 
 * // With descriptions
 * <AnimatedProgressSteps
 *   steps={[
 *     { label: 'Loading', description: 'Fetching earnings data...' },
 *     { label: 'Processing', description: 'Analyzing results...' },
 *     { label: 'Complete', description: 'Ready to view' }
 *   ]}
 *   currentStep={0}
 *   variant="vertical"
 * />
 */

export type StepStatus = 'pending' | 'current' | 'complete' | 'error';

export interface Step {
  label: string;
  description?: string;
  icon?: ReactNode;
}

type StepInput = string | Step;

interface AnimatedProgressStepsProps {
  /** Array of step labels or step objects */
  steps: StepInput[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Layout variant */
  variant?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show step descriptions */
  showDescriptions?: boolean;
  /** Show step numbers instead of icons */
  showNumbers?: boolean;
  /** Color scheme for completed steps */
  completedColor?: 'success' | 'brand' | 'neutral';
  /** Animate step transitions */
  animated?: boolean;
  /** Additional className */
  className?: string;
  /** Callback when a step is clicked (for interactive steps) */
  onStepClick?: (stepIndex: number) => void;
  /** Allow clicking on completed steps only */
  clickableCompleted?: boolean;
}

// Normalize step input to Step object
function normalizeStep(step: StepInput): Step {
  return typeof step === 'string' ? { label: step } : step;
}

// Get step status based on current step
function getStepStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return 'complete';
  if (index === currentStep) return 'current';
  return 'pending';
}

// Checkmark SVG component with draw animation
function CheckmarkIcon({ size = 16, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`step-checkmark ${animated ? 'animated' : ''}`}
    >
      <path
        d="M6 12l4 4 8-8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="checkmark-path"
      />
    </svg>
  );
}

// Single step indicator component
const StepIndicator = memo(function StepIndicator({
  step,
  index,
  status,
  size,
  showNumber,
  animated,
  onClick,
  clickable,
}: {
  step: Step;
  index: number;
  status: StepStatus;
  size: 'sm' | 'md' | 'lg';
  showNumber: boolean;
  animated: boolean;
  onClick?: () => void;
  clickable: boolean;
}) {
  const sizeConfig = {
    sm: { circle: 24, icon: 12, font: 10 },
    md: { circle: 32, icon: 16, font: 12 },
    lg: { circle: 40, icon: 20, font: 14 },
  };

  const config = sizeConfig[size];

  return (
    <button
      type="button"
      onClick={clickable && onClick ? onClick : undefined}
      disabled={!clickable}
      className={`step-indicator status-${status} ${clickable ? 'clickable' : ''}`}
      style={{
        width: config.circle,
        height: config.circle,
        fontSize: config.font,
      }}
      aria-label={`Step ${index + 1}: ${step.label} - ${status}`}
    >
      <span className="step-indicator-content">
        {status === 'complete' ? (
          <CheckmarkIcon size={config.icon} animated={animated} />
        ) : status === 'current' ? (
          <>
            {showNumber ? (
              <span className="step-number">{index + 1}</span>
            ) : step.icon ? (
              <span className="step-custom-icon">{step.icon}</span>
            ) : (
              <span className="step-dot" />
            )}
            <span className="step-pulse-ring" />
          </>
        ) : (
          <>
            {showNumber ? (
              <span className="step-number">{index + 1}</span>
            ) : step.icon ? (
              <span className="step-custom-icon">{step.icon}</span>
            ) : (
              <span className="step-dot pending" />
            )}
          </>
        )}
      </span>
    </button>
  );
});

// Progress line between steps
function ProgressLine({
  status,
  variant,
  size,
  animated,
}: {
  status: 'complete' | 'pending';
  variant: 'horizontal' | 'vertical';
  size: 'sm' | 'md' | 'lg';
  animated: boolean;
}) {
  const thickness = size === 'sm' ? 2 : size === 'md' ? 3 : 4;

  return (
    <div
      className={`progress-line ${variant} status-${status} ${animated ? 'animated' : ''}`}
      style={{
        [variant === 'horizontal' ? 'height' : 'width']: thickness,
      }}
    >
      <div className="progress-line-fill" />
    </div>
  );
}

function AnimatedProgressStepsComponent({
  steps,
  currentStep,
  variant = 'horizontal',
  size = 'md',
  showDescriptions = false,
  showNumbers = false,
  completedColor = 'success',
  animated = true,
  className = '',
  onStepClick,
  clickableCompleted = true,
}: AnimatedProgressStepsProps) {
  const [mounted, setMounted] = useState(false);
  const [prevStep, setPrevStep] = useState(currentStep);
  const prefersReducedMotion = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    setMounted(true);
  }, []);

  // Track step changes for animation direction
  useEffect(() => {
    setPrevStep(currentStep);
  }, [currentStep]);

  const normalizedSteps = steps.map(normalizeStep);
  const isAnimated = animated && !prefersReducedMotion.current;

  return (
    <>
      <div
        className={`
          animated-progress-steps
          variant-${variant}
          size-${size}
          color-${completedColor}
          ${mounted ? 'mounted' : ''}
          ${className}
        `}
      >
        {normalizedSteps.map((step, index) => {
          const status = getStepStatus(index, currentStep);
          const showLine = index < normalizedSteps.length - 1;
          const lineStatus = index < currentStep ? 'complete' : 'pending';

          return (
            <div key={index} className="step-wrapper">
              <div className="step-content">
                <StepIndicator
                  step={step}
                  index={index}
                  status={status}
                  size={size}
                  showNumber={showNumbers}
                  animated={isAnimated}
                  onClick={onStepClick ? () => onStepClick(index) : undefined}
                  clickable={clickableCompleted && status === 'complete' && !!onStepClick}
                />
                {(showDescriptions || step.label) && (
                  <div className="step-text">
                    <span className={`step-label status-${status}`}>{step.label}</span>
                    {showDescriptions && step.description && (
                      <span className={`step-description status-${status}`}>
                        {step.description}
                      </span>
                    )}
                  </div>
                )}
              </div>
              {showLine && (
                <ProgressLine
                  status={lineStatus}
                  variant={variant}
                  size={size}
                  animated={isAnimated}
                />
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .animated-progress-steps {
          display: flex;
          align-items: flex-start;
          gap: 0;
        }

        .animated-progress-steps.variant-horizontal {
          flex-direction: row;
        }

        .animated-progress-steps.variant-vertical {
          flex-direction: column;
        }

        .step-wrapper {
          display: flex;
          align-items: center;
        }

        .variant-horizontal .step-wrapper {
          flex-direction: row;
        }

        .variant-vertical .step-wrapper {
          flex-direction: column;
          align-items: flex-start;
        }

        .step-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .variant-vertical .step-content {
          flex-direction: row;
        }

        /* Step Indicator Button */
        .step-indicator {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 2px solid;
          background: transparent;
          cursor: default;
          transition: all 0.3s var(--spring-snappy, cubic-bezier(0.34, 1.56, 0.64, 1));
          flex-shrink: 0;
        }

        .step-indicator:focus-visible {
          outline: 2px solid var(--accent-blue, #3b82f6);
          outline-offset: 2px;
        }

        .step-indicator.clickable {
          cursor: pointer;
        }

        .step-indicator.clickable:hover {
          transform: scale(1.1);
        }

        /* Pending state */
        .step-indicator.status-pending {
          border-color: var(--border-primary, rgba(255, 255, 255, 0.15));
          color: var(--text-muted, #71717a);
        }

        /* Current state */
        .step-indicator.status-current {
          border-color: var(--accent-blue, #3b82f6);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.1));
          color: var(--accent-blue, #3b82f6);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }

        /* Complete state - success color */
        .color-success .step-indicator.status-complete {
          border-color: var(--success, #22c55e);
          background: var(--success, #22c55e);
          color: white;
        }

        /* Complete state - brand color */
        .color-brand .step-indicator.status-complete {
          border-color: var(--accent-blue, #3b82f6);
          background: linear-gradient(135deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6));
          color: white;
        }

        /* Complete state - neutral */
        .color-neutral .step-indicator.status-complete {
          border-color: var(--text-secondary, #a1a1aa);
          background: var(--text-secondary, #a1a1aa);
          color: white;
        }

        .step-indicator-content {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Step number */
        .step-number {
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        /* Step dot */
        .step-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .step-dot.pending {
          opacity: 0.4;
        }

        /* Pulse ring for current step */
        .step-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--accent-blue, #3b82f6);
          opacity: 0;
          animation: step-pulse 2s ease-out infinite;
        }

        @keyframes step-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        /* Checkmark animation */
        .step-checkmark.animated .checkmark-path {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: checkmark-draw 0.4s ease-out forwards;
        }

        @keyframes checkmark-draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Step text */
        .step-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .step-label {
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .step-label.status-pending {
          color: var(--text-muted, #71717a);
        }

        .step-label.status-current {
          color: var(--text-primary, #e4e4e7);
        }

        .step-label.status-complete {
          color: var(--text-secondary, #a1a1aa);
        }

        .step-description {
          font-size: 0.75rem;
          transition: color 0.2s ease;
        }

        .step-description.status-pending {
          color: var(--text-faint, #52525b);
        }

        .step-description.status-current {
          color: var(--text-muted, #71717a);
        }

        .step-description.status-complete {
          color: var(--text-faint, #52525b);
        }

        /* Progress line */
        .progress-line {
          position: relative;
          background: var(--border-primary, rgba(255, 255, 255, 0.1));
          overflow: hidden;
        }

        .progress-line.horizontal {
          flex: 1;
          min-width: 24px;
          margin: 0 8px;
        }

        .progress-line.vertical {
          min-height: 24px;
          margin: 8px 0;
          margin-left: 15px; /* Center under indicator */
        }

        .progress-line-fill {
          position: absolute;
          background: var(--success, #22c55e);
          transition: all 0.5s var(--spring-snappy, cubic-bezier(0.34, 1.56, 0.64, 1));
        }

        .color-brand .progress-line-fill {
          background: linear-gradient(90deg, var(--accent-blue, #3b82f6), var(--accent-purple, #8b5cf6));
        }

        .color-neutral .progress-line-fill {
          background: var(--text-secondary, #a1a1aa);
        }

        .progress-line.horizontal .progress-line-fill {
          top: 0;
          bottom: 0;
          left: 0;
        }

        .progress-line.vertical .progress-line-fill {
          top: 0;
          left: 0;
          right: 0;
        }

        .progress-line.status-pending .progress-line-fill {
          width: 0;
          height: 0;
        }

        .progress-line.horizontal.status-complete .progress-line-fill {
          width: 100%;
        }

        .progress-line.vertical.status-complete .progress-line-fill {
          height: 100%;
        }

        /* Size variants */
        .size-sm .step-label {
          font-size: 0.75rem;
        }

        .size-sm .step-description {
          font-size: 0.625rem;
        }

        .size-lg .step-label {
          font-size: 1rem;
        }

        .size-lg .step-description {
          font-size: 0.875rem;
        }

        /* Light mode */
        :global(.light) .step-indicator.status-pending {
          border-color: var(--border-primary, rgba(0, 0, 0, 0.1));
          color: var(--text-muted, #71717a);
        }

        :global(.light) .step-indicator.status-current {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        :global(.light) .step-label.status-current {
          color: var(--text-primary, #18181b);
        }

        :global(.light) .progress-line {
          background: var(--border-primary, rgba(0, 0, 0, 0.08));
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .step-indicator,
          .progress-line-fill {
            transition: none;
          }

          .step-pulse-ring {
            animation: none;
            opacity: 0.3;
          }

          .step-checkmark.animated .checkmark-path {
            animation: none;
            stroke-dashoffset: 0;
          }
        }

        /* Mount animation */
        .animated-progress-steps:not(.mounted) .step-indicator {
          opacity: 0;
          transform: scale(0.8);
        }

        .animated-progress-steps.mounted .step-indicator {
          opacity: 1;
          transform: scale(1);
        }
      `}</style>
    </>
  );
}

export const AnimatedProgressSteps = memo(AnimatedProgressStepsComponent);

/**
 * useStepProgress - Hook for managing step progress state
 * 
 * @example
 * const { currentStep, goToStep, next, prev, isComplete } = useStepProgress(3);
 */
export function useStepProgress(totalSteps: number, initialStep = 0) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const next = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => setCurrentStep(0);

  return {
    currentStep,
    goToStep,
    next,
    prev,
    reset,
    isFirst: currentStep === 0,
    isLast: currentStep === totalSteps - 1,
    isComplete: currentStep >= totalSteps - 1,
    totalSteps,
  };
}

export default AnimatedProgressSteps;
