import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ProfileCompletionScreenProps {
  visible: boolean;
  completion: {
    percentage: number;
    completedCount: number;
    tasks: readonly { readonly name: string; readonly completed: boolean }[];
  };
  onClose: () => void;
  onStartSwappySetup: () => void;
}

export function ProfileCompletionScreen({
  visible,
  completion,
  onClose,
  onStartSwappySetup,
}: ProfileCompletionScreenProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Profile Completion</Text>
              <Text style={styles.progressPercentage}>{completion.percentage}%</Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${completion.percentage}%` },
                ]}
              />
            </View>

            <Text style={styles.completedCount}>
              {completion.completedCount} of {completion.tasks.length} tasks completed
            </Text>
          </View>

          {/* Tasks Section */}
          <View style={styles.tasksSection}>
            <Text style={styles.tasksTitle}>Profile Tasks</Text>

            {completion.tasks.map((task, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.taskCard}
                onPress={() => {
                  if (task.name === 'Activate Swappy profile' && !task.completed) {
                    onStartSwappySetup();
                  }
                }}
                disabled={task.completed}
              >
                <View style={styles.taskLeft}>
                  <View
                    style={[
                      styles.taskCheckbox,
                      task.completed && styles.taskCheckboxCompleted,
                    ]}
                  >
                    {task.completed && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.taskName}>{task.name}</Text>
                </View>
                {!task.completed && (
                  <Ionicons name="chevron-forward" size={20} color="#14B8A6" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {completion.tasks.every((t) => t.completed) && (
            <View style={styles.completedSection}>
              <Ionicons name="checkmark-circle" size={64} color="#14B8A6" />
              <Text style={styles.completedTitle}>Profile Complete!</Text>
              <Text style={styles.completedSubtitle}>
                Your profile is fully set up and ready to go.
              </Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14B8A6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
  },
  completedCount: {
    fontSize: 13,
    color: '#666',
  },
  tasksSection: {
    backgroundColor: '#fff',
    padding: 20,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxCompleted: {
    backgroundColor: '#14B8A6',
    borderColor: '#14B8A6',
  },
  taskName: {
    fontSize: 15,
    color: '#333',
  },
  completedSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
