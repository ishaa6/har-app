export const ACTION_GROUPS = {
  Sports: [
    "Archery","Baseball Pitch","Basketball Shooting","Basketball Dunk","Bench Press",
    "Biking","Bowling","Boxing Punching Bag","Boxing Speed Bag","Cliff Diving",
    "Cricket Bowling","Cricket Shot","Diving","Fencing","Field Hockey Penalty",
    "Floor Gymnastics","Golf Swing","Hammer Throw","High Jump","Horse Race",
    "Horse Riding","Hula Hoop","Ice Dancing","Javelin Throw","Jump Rope",
    "Jumping Jack","Kayaking","Long Jump","Lunges","Parallel Bars","Pole Vault",
    "Rock Climbing Indoor","Rope Climbing","Rowing","Skateboarding","Skiing",
    "Skijet","Soccer Juggling","Surfing","Swimming","Swing","Table Tennis Shot",
    "Tennis Swing","Throw Discus","Volleyball Spiking","Walking with a dog",
  ],
  Fitness: [
    "Body Weight Squats","Clean and Jerk","Handstand Pushups","Handstand Walking",
    "Pull Ups","Push Ups","TaiChi","Yoga",
  ],
  Music: [
    "Drumming","Playing Cello","Playing Daf","Playing Dhol","Playing Flute",
    "Playing Guitar","Playing Piano","Playing Sitar","Playing Tabla","Playing Violin",
  ],
  Daily: [
    "Apply Eye Makeup","Apply Lipstick","Blow Dry Hair","Blowing Candles",
    "Brushing Teeth","Cutting In Kitchen","Haircut","Head Massage","Knitting",
    "Mixing Batter","Mopping Floor","Pizza Tossing","Shaving Beard","Writing On Board",
  ],
  Performance: [
    "Baby Crawling","Balance Beam","Band Marching","Frisbee Catch","Front Crawl",
    "Juggling Balls","Military Parade","Nunchucks","Pommel Horse","Salsa Spins","Breaststroke",
  ],
};

export const GROUP_COLORS = {
  Sports:      "#00e5ff",
  Fitness:     "#00e5a0",
  Music:       "#f5c518",
  Daily:       "#ff8c42",
  Performance: "#c77dff",
  Other:       "#7a8899",
};

export function getGroup(activity) {
  return (
    Object.entries(ACTION_GROUPS).find(([, acts]) =>
      acts.some((a) => a.toLowerCase() === activity.toLowerCase())
    )?.[0] || "Other"
  );
}