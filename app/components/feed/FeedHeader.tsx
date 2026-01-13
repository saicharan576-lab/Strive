import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FeedHeaderProps {
  activeTab: 'feedy' | 'swappy';
  onTabChange: (tab: 'feedy' | 'swappy') => void;
}

export const FeedHeader = React.memo<FeedHeaderProps>(({ activeTab, onTabChange }) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={activeTab === 'feedy' ? styles.activeTab : styles.tab}
      onPress={() => onTabChange('feedy')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === 'feedy' }}
    >
      <Text style={activeTab === 'feedy' ? styles.activeTabText : styles.tabText}>
        Feedy
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={activeTab === 'swappy' ? styles.activeTab : styles.tab}
      onPress={() => onTabChange('swappy')}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === 'swappy' }}
    >
      <Text style={activeTab === 'swappy' ? styles.activeTabText : styles.tabText}>
        Swappy
      </Text>
    </TouchableOpacity>
  </View>
));

FeedHeader.displayName = 'FeedHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#8A2BE2',
  },
  tabText: {
    color: 'gray',
    fontSize: 16,
  },
  activeTabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
