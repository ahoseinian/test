import React, {useRef} from 'react';
import {WsProvider, ApiPromise} from '@polkadot/api';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  Button,
  InteractionManager,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  // useWs();
  const getTips = usePolkadot();
  const isDarkMode = useColorScheme() === 'dark';

  const [number, setNumber] = React.useState(0);

  React.useEffect(() => {
    setTimeout(() => {
      setNumber(number => number + 1);
    }, 400);
  }, [number]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Text>{number}</Text>
        <Button onPress={() => setNumber(number + 100)} title="Increment" />
        <View style={styles.gap} />
        <Button onPress={getTips} title="GET TIPS" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  gap: {
    height: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

function logger(...msg) {
  console.log(
    `${new Date().toLocaleTimeString()}: ${msg
      .map(m => JSON.stringify(m))
      .join(' ')}`,
  );
}

function useWs() {
  React.useEffect(() => {
    const ws = new WebSocket('wss://rpc.polkadot.io');
    // const ws = new WebSocket('ws://a07dc0705c70.ngrok.io');
    ws.onopen = () => {
      logger('open WS');
      ws.send(
        JSON.stringify({
          id: 6,
          jsonrpc: '2.0',
          method: 'state_getMetadata',
          params: [],
        }),
      );
    };
    ws.onmessage = event => {
      logger('message', event);
      logger(event.data);
    };
    ws.onclose = () => {
      logger('close WS');
    };
    ws.onerror = event => {
      logger('error WS', event);
    };

    return () => {
      ws.close();
    };
  }, []);
}

function usePolkadot() {
  let promise = useRef(null);
  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      const provider = new WsProvider(
        // 'wss://rpc.polkadot.io',
        'wss://staging.registrar.litentry.io',
        false,
      );
      // const provider = new WsProvider('ws://a07dc0705c70.ngrok.io', false);
      promise.current = new ApiPromise({provider});
      promise.current.connect().then(() => {
        logger('Connected to polkadot');
      });

      promise.current.on('ready', () => {
        logger(
          '======================================================================Polkadot is ready',
        );
        logger(
          '======================================================================Polkadot is ready',
        );
        logger(
          '======================================================================Polkadot is ready',
        );
        promise.current.query.tips.tips
          .keys()
          .then(keys => keys.map(key => key.args[0].toHex()))
          .then(console.log);
      });

      promise.current.on('disconnected', () => {
        console.log('Polkadot is disconnected');
      });

      promise.current.on('error', error => {
        console.log('Polkadot error', error);
      });

      promise.current.on('connected', () => {
        console.log('Polkadot is connected');
      });
    });
  }, []);

  return () => {
    promise.current.query.tips.tips.keys().then(console.log);
  };
}
