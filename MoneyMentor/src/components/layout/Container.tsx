// src/components/layout/Container.tsx
import React, { ReactNode } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';

interface ContainerProps {
  children: ReactNode;
  className?: never; 
  safeArea?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  safeArea = true,
}) => {
  const ContainerComponent = safeArea ? SafeAreaView : View;

  return (
    <ContainerComponent style={[styles.container]}>
      {children}
    </ContainerComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

export default Container;