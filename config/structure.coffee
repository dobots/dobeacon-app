# Read more about app structure at http://docs.appgyver.com

module.exports =

  # See styling options for tabs and other native components in app/common/native-styles/ios.css or app/common/native-styles/android.css
  tabs: [
    {
      title: "Index"
      id: "index"
#      location: "example#using-the-scanner" # Supersonic module#view type navigation
      location: "example#getting-started" # Supersonic module#view type navigation
    }
    {
      title: "Settings"
      id: "settings"
      location: ""
#      location: "example#settings"
    }
    {
      title: "Internet"
      id: "internet"
      location: "https://dobots.nl" # URLs are supported!
    }
  ]

  # rootView:
  #   location: "example#getting-started"

  preloads: [
    {
      id: "learn-more"
      location: "example#learn-more"
    }
    {
      id: "using-the-scanner"
      location: "example#using-the-scanner"
    }
    {
      id: "beacon"
      location: "example#beacon"
    }
    {
      id: "configure-all"
      location: "example#configure-all"
    }
  ]

  # drawers:
  #   left:
  #     id: "leftDrawer"
  #     location: "example#drawer"
  #     showOnAppLoad: false
  #   options:
  #     animation: "swingingDoor"
  #
  # initialView:
  #   id: "initialView"
  #   location: "example#initial-view"
