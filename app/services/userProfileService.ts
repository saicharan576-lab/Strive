import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabaseConfig';

export interface UserProfile {
  id: string;
  User_id: string;
  User_name?: string;
  Profile_name?: string;
  Date_of_birth?: string;
  Gender?: string;
  Mobile_number?: string;
  Email_id?: string;
  Bio?: string;
  Profile_picture?: string;
  Interest_cat_1?: string;
  Interest_cat_2?: string;
  Interest_cat_3?: string;
  created_at: string;
  last_logout_time?: string;
}

/**
 * Creates a new user profile or retrieves existing one based on mobile number
 * @param mobileNumber - User's mobile number (unique identifier)
 * @returns UserProfile object
 */
export const createOrGetUserProfile = async (
  mobileNumber: string
): Promise<UserProfile | null> => {
  try {
    console.log('🔍 Checking profile for mobile:', mobileNumber);

    // First, check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('User_Profile')
      .select('*')
      .eq('Mobile_number', mobileNumber)
      .maybeSingle();

    if (existingProfile && !fetchError) {
      console.log('✅ Existing profile found:', existingProfile.User_id);
      
      // Store profile in AsyncStorage
      await AsyncStorage.setItem('userProfile', JSON.stringify(existingProfile));
      await AsyncStorage.setItem('userId', existingProfile.User_id);
      await AsyncStorage.setItem('userMobile', mobileNumber);
      
      return existingProfile;
    }

    // Profile doesn't exist, create new one
    console.log('📝 Creating new profile for:', mobileNumber);
    
    // Generate a unique User_id
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newProfile = {
      User_id: userId,
      Mobile_number: mobileNumber,
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('User_Profile')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      throw createError;
    }

    console.log('✅ New profile created:', createdProfile.User_id);

    // Store profile in AsyncStorage
    await AsyncStorage.setItem('userProfile', JSON.stringify(createdProfile));
    await AsyncStorage.setItem('userId', createdProfile.User_id);
    await AsyncStorage.setItem('userMobile', mobileNumber);

    return createdProfile;
  } catch (error) {
    console.error('Exception in createOrGetUserProfile:', error);
    return null;
  }
};

/**
 * Updates user profile
 * @param userId - User's User_id
 * @param updates - Fields to update
 * @returns Updated UserProfile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'User_id' | 'created_at'>>
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('User_Profile')
      .update(updates)
      .eq('User_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    // Update AsyncStorage
    await AsyncStorage.setItem('userProfile', JSON.stringify(data));

    return data;
  } catch (error) {
    console.error('Exception in updateUserProfile:', error);
    return null;
  }
};

/**
 * Saves user interests after category selection
 * @param userId - User's User_id
 * @param interests - Array of selected interest IDs
 * @returns Success status
 */
export const saveUserInterests = async (
  userId: string,
  interests: string[]
): Promise<boolean> => {
  try {
    // Prepare update object with first 3 interests
    const interestUpdates: any = {
      Interest_cat_1: interests[0] || null,
      Interest_cat_2: interests[1] || null,
      Interest_cat_3: interests[2] || null,
    };

    console.log('💾 Saving interests to database for userId:', userId);
    console.log('📊 Interests:', interestUpdates);

    // Save to Supabase User_Profile table
    const { data, error } = await supabase
      .from('User_Profile')
      .update(interestUpdates)
      .eq('User_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error saving interests to database:', error);
      throw error;
    }

    console.log('✅ Interests saved to database successfully');

    // Also save to AsyncStorage for offline access
    await Promise.all([
      AsyncStorage.setItem('userInterests', JSON.stringify(interests)),
      AsyncStorage.setItem('hasCompletedOnboarding', 'true'),
      AsyncStorage.setItem('userProfile', JSON.stringify(data)),
    ]);

    console.log('✅ User interests saved for userId:', userId);
    return true;
  } catch (error) {
    console.error('Exception in saveUserInterests:', error);
    return false;
  }
};

/**
 * Updates user interests (can be called from profile settings)
 * @param userId - User's User_id
 * @param interests - Array of selected interest IDs
 * @returns Success status
 */
export const updateUserInterests = async (
  userId: string,
  interests: string[]
): Promise<boolean> => {
  try {
    // Prepare update object with first 3 interests
    const interestUpdates: any = {
      Interest_cat_1: interests[0] || null,
      Interest_cat_2: interests[1] || null,
      Interest_cat_3: interests[2] || null,
    };

    console.log('🔄 Updating interests in database for userId:', userId);
    console.log('📊 New interests:', interestUpdates);

    // Update in Supabase User_Profile table
    const { data, error } = await supabase
      .from('User_Profile')
      .update(interestUpdates)
      .eq('User_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating interests in database:', error);
      throw error;
    }

    console.log('✅ Interests updated in database successfully');

    // Update AsyncStorage
    await Promise.all([
      AsyncStorage.setItem('userInterests', JSON.stringify(interests)),
      AsyncStorage.setItem('userProfile', JSON.stringify(data)),
    ]);

    console.log('✅ User interests updated for userId:', userId);
    return true;
  } catch (error) {
    console.error('Exception in updateUserInterests:', error);
    return false;
  }
};

/**
 * Gets user profile from AsyncStorage
 * @returns UserProfile from local storage
 */
export const getCachedUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const profileStr = await AsyncStorage.getItem('userProfile');
    return profileStr ? JSON.parse(profileStr) : null;
  } catch (error) {
    console.error('Error getting cached profile:', error);
    return null;
  }
};

/**
 * Gets user profile from Supabase by mobile number
 * @param mobileNumber - User's mobile number
 * @returns UserProfile from database
 */
export const getUserProfileByMobile = async (
  mobileNumber: string
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('User_Profile')
      .select('*')
      .eq('Mobile_number', mobileNumber)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getUserProfileByMobile:', error);
    return null;
  }
};

/**
 * Clears user profile from AsyncStorage (on logout)
 */
export const clearUserProfile = async (): Promise<void> => {
  try {
    // Get userId before clearing for logout tracking
    const userId = await AsyncStorage.getItem('userId');
    
    if (userId) {
      // Update last_logout_time in database
      await supabase
        .from('User_Profile')
        .update({ last_logout_time: new Date().toISOString() })
        .eq('User_id', userId);
    }

    await AsyncStorage.multiRemove([
      'userProfile',
      'userId',
      'userMobile',
      'isLoggedIn',
      'hasCompletedOnboarding',
      'userInterests',
    ]);
  } catch (error) {
    console.error('Error clearing user profile:', error);
  }
};
