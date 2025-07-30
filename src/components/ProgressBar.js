import React from 'react';
import {View, StyleSheet} from 'react-native';

export default function ProgressBar({progress, label}) {
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, {width: `${progress * 100}%`}]} />
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  label: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
});