import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../../_types/swappyfeed';

interface CategoryChipProps {
  category: Category;
  isSelected: boolean;
  onPress: (categoryId: string | null) => void;
}

const CategoryChip: React.FC<CategoryChipProps> = React.memo(({ 
  category, 
  isSelected, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected && styles.chipSelected
      ]}
      onPress={() => onPress(isSelected ? null : category.id)}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${category.name}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Ionicons
        name={category.icon as any}
        size={16}
        color={isSelected ? '#fff' : '#374151'}
      />
      <Text style={[
        styles.chipText,
        isSelected && styles.chipTextSelected
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
});

CategoryChip.displayName = 'CategoryChip';

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: '#4f46e5',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
});

export default CategoryChip;