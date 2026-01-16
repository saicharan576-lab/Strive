import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SwappyFeed from '../screens/swappyfeed';
import {
    LearnFunnelCTA,
    SmartReactionPopup,
    TeachFunnelCTA
} from '../screens/swappypartner/components';

// Custom Hooks
import { useAuth } from '../_context/AuthContext';
import { usePosts } from '../_hooks/usePosts';

// Components
import { LoginScreen } from '../components/auth/LoginScreen';
import { PostCard } from '../components/feed/PostCard';

// Types
import { Post, ReactionType } from '../_types/post';

type TabParamList = {
  Feedy: undefined;
  Swappy: undefined;
};

const Tab = createMaterialTopTabNavigator<TabParamList>();
const SCREEN_WIDTH = Dimensions.get('window').width;

// Custom Tab Bar Component
const CustomTabBar = React.memo(({ state, navigation }: MaterialTopTabBarProps) => {
  const handleTabChange = useCallback((tab: 'feedy' | 'swappy') => {
    const index = tab === 'feedy' ? 0 : 1;
    navigation.navigate(state.routeNames[index]);
  }, [navigation, state.routeNames]);

  const activeTab = state.index === 0 ? 'feedy' : 'swappy';

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabButtonsRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'feedy' && styles.activeTabButton,
          ]}
          onPress={() => handleTabChange('feedy')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'feedy' }}
          accessibilityLabel="Feedy tab"
        >
          <Text style={[
            styles.tabText,
            activeTab === 'feedy' && styles.activeTabText,
          ]}>
            Feedy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'swappy' && styles.activeTabButton,
          ]}
          onPress={() => handleTabChange('swappy')}
          activeOpacity={0.7}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'swappy' }}
          accessibilityLabel="Swappy tab"
        >
          <Text style={[
            styles.tabText,
            activeTab === 'swappy' && styles.activeTabText,
          ]}>
            Swappy
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
CustomTabBar.displayName = 'CustomTabBar';

// Modal Overlay for CTAs
const FunnelCTAOverlay = React.memo<{
  type: 'teach' | 'learn' | null;
  topic: string;
  onClose: () => void;
}>(({ type, topic, onClose }) => {
  if (!type) return null;

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlayContainer}>
        <TouchableOpacity 
          style={styles.overlayBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.overlayContent}>
          {type === 'teach' ? (
            <TeachFunnelCTA
              topic={topic}
              onOfferService={() => {
                console.log('Offering service for:', topic);
                onClose();
              }}
              onClose={onClose}
            />
          ) : (
            <LearnFunnelCTA
              skillName={topic}
              onClose={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
});
FunnelCTAOverlay.displayName = 'FunnelCTAOverlay';

// Loading Component
const LoadingView = React.memo(() => (
  <View style={styles.centerContainer}>
    <ActivityIndicator size="large" color="#8A2BE2" />
    <Text style={styles.loadingText}>Loading posts...</Text>
  </View>
));
LoadingView.displayName = 'LoadingView';

// Error Component
const ErrorView = React.memo(({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <View style={styles.centerContainer}>
    <Text style={styles.errorIcon}>⚠️</Text>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity 
      style={styles.retryButton} 
      onPress={onRetry}
      accessibilityRole="button"
      accessibilityLabel="Retry loading posts"
    >
      <Text style={styles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
));
ErrorView.displayName = 'ErrorView';

// Empty State Component
const EmptyView = React.memo(() => (
  <View style={styles.centerContainer}>
    <Text style={styles.emptyIcon}>📝</Text>
    <Text style={styles.emptyText}>No posts yet</Text>
    <Text style={styles.emptySubtext}>Be the first to share something!</Text>
  </View>
));
EmptyView.displayName = 'EmptyView';

// Feedy Tab Screen
const FeedyScreen = React.memo(() => {
  const { posts, loading, error, refreshing, refresh } = usePosts();
  const [smartReactionOpen, setSmartReactionOpen] = useState(false);
  const [selectedPostForReaction, setSelectedPostForReaction] = useState<string | null>(null);
  const [funnelCTAType, setFunnelCTAType] = useState<'teach' | 'learn' | null>(null);
  const [funnelCTATopic, setFunnelCTATopic] = useState('');

  const handlePostLongPress = useCallback((postId: string) => {
    setSelectedPostForReaction(postId);
    setSmartReactionOpen(true);
  }, []);

  const handleReactionSelect = useCallback((action: ReactionType) => {
    const post = posts.find(p => p.id === selectedPostForReaction);
    const topic = post?.title || '';
    
    if (action === 'teach') {
      setFunnelCTAType('teach');
      setFunnelCTATopic(topic);
    } else if (action === 'learn') {
      setFunnelCTAType('learn');
      setFunnelCTATopic(topic);
    }
    
    setSmartReactionOpen(false);
    setSelectedPostForReaction(null);
  }, [selectedPostForReaction, posts]);

  const handleCloseSmartReaction = useCallback(() => {
    setSmartReactionOpen(false);
    setSelectedPostForReaction(null);
  }, []);

  const handleCloseFunnelCTA = useCallback(() => {
    setFunnelCTAType(null);
    setFunnelCTATopic('');
  }, []);

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLongPress={handlePostLongPress}
    />
  ), [handlePostLongPress]);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  if (loading && !refreshing) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView error={error.message} onRetry={refresh} />;
  }

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderPost}
        ListEmptyComponent={<EmptyView />}
        showsVerticalScrollIndicator={false}
        style={styles.feedList}
        contentContainerStyle={styles.feedListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={['#8A2BE2']}
            tintColor="#8A2BE2"
          />
        }
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
      />

      <SmartReactionPopup
        isOpen={smartReactionOpen}
        onClose={handleCloseSmartReaction}
        onSelect={handleReactionSelect}
      />

      <FunnelCTAOverlay
        type={funnelCTAType}
        topic={funnelCTATopic}
        onClose={handleCloseFunnelCTA}
      />
    </>
  );
});
FeedyScreen.displayName = 'FeedyScreen';

// Swappy Tab Screen
const SwappyScreen = React.memo(() => <SwappyFeed onClose={() => {}} />);
SwappyScreen.displayName = 'SwappyScreen';

// Feed Tabs Navigator
const FeedNavigator = React.memo(() => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{
      lazy: true,
      swipeEnabled: true,
    }}
  >
    <Tab.Screen 
      name="Feedy" 
      component={FeedyScreen}
      options={{ title: 'Feedy' }}
    />
    <Tab.Screen 
      name="Swappy" 
      component={SwappyScreen}
      options={{ title: 'Swappy' }}
    />
  </Tab.Navigator>
));
FeedNavigator.displayName = 'FeedNavigator';

// Main Component
export default function HomeScreen() {
  const { user, loading, handleLogin } = useAuth();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} loading={loading} />;
  }

  return (
    <SafeAreaView style={styles.feedContainer} edges={['top']}>
      <FeedNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  feedContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBarContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  tabButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: '#8A2BE2',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8A2BE2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  feedList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  feedListContent: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
  },
});
