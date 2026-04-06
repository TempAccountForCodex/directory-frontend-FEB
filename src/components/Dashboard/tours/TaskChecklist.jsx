/**
 * TaskChecklist
 *
 * Renders an onboarding task checklist inside a DashboardCard.
 * Shows a progress bar, task items with check icons, and a CTA button
 * for the first incomplete task.
 *
 * Props:
 *   tasks          {Array}           Array of task objects from ONBOARDING_TASKS
 *   completedTasks {Set|Array}       Set or array of completed task checkKeys
 *   onTaskClick    {function}        Called with (task) when user clicks a CTA
 *
 * Step 10.11 — Welcome Tour & Onboarding
 */

import React, { useMemo, useCallback, memo } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { DashboardCard, DashboardGradientButton } from '../shared';

const TaskItem = memo(({ task, isCompleted, isActive, onTaskClick, colors }) => {
  const handleClick = useCallback(() => {
    if (!isCompleted && onTaskClick) {
      onTaskClick(task);
    }
  }, [task, isCompleted, onTaskClick]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          py: 1.25,
          borderBottom: `1px solid ${colors.border}`,
          '&:last-child': { borderBottom: 'none' },
          opacity: isCompleted ? 0.7 : 1,
        }}
      >
        {/* Icon */}
        <Box sx={{ mt: '2px', flexShrink: 0 }}>
          {isCompleted ? (
            <CheckCircle2 size={20} color={colors.primary} />
          ) : (
            <Circle size={20} color={colors.textSecondary} />
          )}
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isCompleted ? 500 : 600,
              color: isCompleted ? colors.textSecondary : colors.text,
              textDecoration: isCompleted ? 'line-through' : 'none',
              lineHeight: 1.4,
            }}
          >
            {task.label}
          </Typography>
          {!isCompleted && (
            <Typography variant="caption" sx={{ color: colors.textSecondary, lineHeight: 1.4 }}>
              {task.description}
            </Typography>
          )}
          {isActive && !isCompleted && (
            <Box sx={{ mt: 1 }}>
              <DashboardGradientButton
                size="small"
                onClick={handleClick}
                aria-label={`Start task: ${task.label}`}
                sx={{ minHeight: 44, fontSize: '0.78rem' }}
              >
                Get started
              </DashboardGradientButton>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
});

TaskItem.displayName = 'TaskItem';

const TaskChecklist = memo(({ tasks = [], completedTasks = [], onTaskClick }) => {
  const { actualTheme } = useTheme();
  const colors = getDashboardColors(actualTheme);

  const completedSet = useMemo(() => {
    if (completedTasks instanceof Set) return completedTasks;
    return new Set(Array.isArray(completedTasks) ? completedTasks : []);
  }, [completedTasks]);

  const completedCount = useMemo(
    () => tasks.filter((t) => completedSet.has(t.checkKey)).length,
    [tasks, completedSet]
  );

  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // First incomplete task gets the active CTA
  const firstIncompleteIndex = useMemo(
    () => tasks.findIndex((t) => !completedSet.has(t.checkKey)),
    [tasks, completedSet]
  );

  return (
    <DashboardCard>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text }}>
            Getting Started
          </Typography>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {completedCount} of {tasks.length} complete
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          aria-label={`Onboarding progress: ${completedCount} of ${tasks.length} tasks complete`}
          sx={{
            height: 6,
            borderRadius: 3,
            background: colors.border,
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight || colors.primary} 100%)`,
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* Task list */}
      <Box>
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            isCompleted={completedSet.has(task.checkKey)}
            isActive={index === firstIncompleteIndex}
            onTaskClick={onTaskClick}
            colors={colors}
          />
        ))}
      </Box>
    </DashboardCard>
  );
});

TaskChecklist.displayName = 'TaskChecklist';

export default TaskChecklist;
