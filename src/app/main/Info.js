import { View } from 'react-native';
import React, { useState, useEffect } from 'react';
import Para from '../../component/molecules/Para';
import Money from '../../component/molecules/Money';
import Image from '../../component/molecules/Images';
import Explore from '../../component/molecules/Explore';
import Find from '../../component/molecules/Find';
import { useSelector } from 'react-redux';

const Info = () => {
  const info = useSelector((state) => state.info);
  const [page, setPage] = useState(info);

  // Update page state when info from Redux changes
  useEffect(() => {
    setPage(info);
    
  }, [info]);

  const activePage = () => {
    switch (page) {
      case "Text":
        return <Para />;
      case "Currency":
        return <Money />;
      case "Images":
        return <Image />;
      case "Explore":
        return <Explore />;
      case "Find":
        return <Find />;
      default:
        return null; // Return null to avoid errors
    }
  };

  return <View>{activePage()}</View>; // Call the function
};

export default Info;
