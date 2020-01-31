import { StyleSheet } from 'react-native';

export default globalStyle = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#222222',
  },
  toolBar: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: "auto",
    marginRight: "auto",
  },
  statusBar: {
    height: 80,
    flexDirection: 'row'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  infoContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.2,
    height: 30,
    backgroundColor: '#dedede'
  },
  controlContent: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative',
    zIndex: 100
  },
  powerButton: {
    height: 60,
    paddingHorizontal: 30,
    minWidth: 100,
    borderRadius: 20,
    backgroundColor: "#ffffff33",
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: "relative"
  },
  gearButtons: {
    flexDirection:"row",
    flexWrap:"nowrap"
  },
  gyroButton: {
    height: 40,
    paddingHorizontal: 10,
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
    backgroundColor: "#ffffff33",
    justifyContent: 'center',
    alignItems: 'center',
    position: "relative"
  },
  gyroButtonText: {
    fontSize: 16,
    color: "#ffffff"
  },
  gearButton: {
    height: 50,
    paddingHorizontal: 15,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    backgroundColor: "#ffffff55",
    justifyContent: 'center',
    alignItems: 'center',
    position: "relative"
  },
  gearButtonText: {
    fontSize: 12,
    color: "#ffffff"
  },
  activeButton: {
    backgroundColor:"#226622"
  },
  buttonText: {
    fontSize: 26,
    paddingHorizontal: 20,
    color: "#ffffff"
  },
  logScroll: {
    marginLeft: "auto",
    marginRight: "auto",
    flexDirection: "column-reverse"
  },
  logText: {
    fontSize: 12,
    color: "#ffffff"
  }
});
