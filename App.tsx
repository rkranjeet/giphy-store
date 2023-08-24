import MasonryList from '@react-native-seoul/masonry-list';
import * as React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Searchbar} from 'react-native-paper';
import GifPlayer from './components/GifPlayer';

import Constants from 'expo-constants';
import {
  API_KEY,
  BASE_URL,
  BLACK,
  DEBOUNCE_DELAY,
  MOON_URL,
  PAGE_SIZE,
  RATING,
  SEARCH,
  SUN_URL,
  TRENDING,
  WHITE,
} from './constants/AppConst';
import debounce from './utils/debounce';

const windowWidth = Dimensions.get('window').width;
const widthRatio = windowWidth / 360;

function App() {
  const [isLightTheme, setIsLightTheme] = React.useState(true);
  const [searchText, setSearchText] = React.useState('');
  const [data, setData] = React.useState<any>([]);
  const [offSet, setOffSet] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(Infinity);

  const renderItem = React.useCallback(({item}: any) => {
    return <GifPlayer {...item} />;
  }, []);

  const searchAPICall = React.useCallback(
    function (searchText: any) {
      const url = `${BASE_URL}${SEARCH}?api_key=${API_KEY}&limit=${PAGE_SIZE}&rating=${RATING}&offset=0&q=${searchText}`;
      (async () => {
        let responseString = await fetch(url);
        let response = await responseString.json();
        setTotalCount(response.pagination.total_count);
        const curr_data = response.data.map((item, index) => {
          const {width, height} = item.images.original;
          return {
            id: item.id,
            width: 160 * widthRatio,
            height: 160 * (height / width) * widthRatio,
            key: offSet * PAGE_SIZE + index,
          };
        });
        setData(curr_data);
      })();
    },
    [offSet],
  );

  const renderThemeToggler = React.useCallback(
    function () {
      const iconUrl = isLightTheme ? SUN_URL : MOON_URL;
      return (
        <View style={{marginLeft: 10, position: 'absolute', top: 5, right: 5}}>
          <TouchableOpacity
            onPress={() => setIsLightTheme(isLightTheme => !isLightTheme)}>
            <Image source={{uri: iconUrl}} style={{width: 40, height: 40}} />
          </TouchableOpacity>
        </View>
      );
    },
    [isLightTheme],
  );
  const debouncedSearchAPICall = React.useCallback(
    debounce(searchAPICall, DEBOUNCE_DELAY),
    [offSet],
  );

  React.useEffect(() => {
    const trendingOrSearch = searchText === '' ? TRENDING : SEARCH;
    if (offSet < totalCount) {
      const url = `${BASE_URL}${trendingOrSearch}?api_key=${API_KEY}&limit=${PAGE_SIZE}&rating=${RATING}&offset=${offSet}&q=${searchText}`;
      console.log('url', url);
      (async () => {
        let responseString = await fetch(url);
        let response = await responseString.json();
        if (response.pagination.total_count != totalCount) {
          setTotalCount(response.pagination.total_count);
        }
        //console.log('res', JSON.stringify(response));
        const curr_data = response.data.map((item: any, index: any) => {
          const {width, height} = item.images.original;
          return {
            id: item.id,
            width: 160 * widthRatio,
            height: 160 * (height / width) * widthRatio,
            key: offSet + index,
          };
        });
        //setPageIndex((pageIndex) => pageIndex+1);
        setData((prevData: any) => [...prevData, ...curr_data]);
      })();
    } else {
      console.log('End Reached');
    }
  }, [offSet, searchText, totalCount]);

  React.useEffect(() => {
    if (offSet != 0) setOffSet(0);

    if (searchText !== '') {
      debouncedSearchAPICall(searchText);
    }
  }, [debouncedSearchAPICall, offSet, searchText]);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isLightTheme == true ? WHITE : BLACK},
      ]}>
      <View style={{position: 'relative', top: 0, left: 0}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginLeft: 10,
          }}>
          <View style={{height: 75, width: windowWidth - 70}}>
            <Searchbar
              autoCompleteType=""
              placeholder="Search GIPHY"
              onChangeText={text => {
                setSearchText(text);
              }}
              value={searchText}
            />
          </View>
          {renderThemeToggler()}
        </View>
      </View>
      <MasonryList
        data={data}
        keyExtractor={(item): string => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        onEndReached={() => setOffSet(index => index + PAGE_SIZE)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 10,
    padding: 5,
  },
});

export default App;
