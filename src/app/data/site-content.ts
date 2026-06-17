export interface QuickFact {
  label: string;
  value: string;
}

export interface UniversityProject {
  slug: string;
  title: string;
  institution: string;
  languages: string[];
  summary: string;
  detail: string[];
  images: string[];
  tags: string[];
}

export interface ContactLink {
  label: string;
  value: string;
  href: string;
  icon: 'email' | 'github' | 'linkedin' | 'phone';
}

export interface SiteContent {
  name: string;
  monogram: string;
  role: string;
  tagline: string;
  subtitle: string;
  valueStatement: string;
  aboutParagraphs: string[];
  quickFacts: QuickFact[];
  interests: string[];
  projects: UniversityProject[];
  contactLinks: ContactLink[];
  cv: {
    filename: string;
    path: string;
    updatedLabel: string;
  };
  legacy: {
    bundledPath: string;
    fallbackUrl: string;
  };
}

const LEGACY_IMG = 'assets/legacy/nc_assets/img/featured';

export const SITE_CONTENT: SiteContent = {
  name: 'Nicholas Krause',
  monogram: 'NK',
  role: 'Mechatronics Engineer',
  tagline: 'Embedded Systems · Robotics · Computer Vision',
  subtitle: 'First Class Honours, University of Canterbury',
  valueStatement: 'I build intelligent systems that sense, think, and act in the real world.',
  aboutParagraphs: [
    'I am a Mechatronics Engineer with a strong focus on embedded systems, robotics, and computer vision. I enjoy designing and building systems that bridge hardware and software to solve real-world problems.',
    'A dual citizen of the USA and New Zealand, I completed my Mechatronics Engineering degree with First Class Honours at the University of Canterbury. I thrive in multidisciplinary teams and am always eager to learn, innovate, and take on new challenges across the electronics and software industry.',
  ],
  quickFacts: [
    { label: 'Citizenship', value: 'USA & New Zealand' },
    { label: 'Degree', value: 'BEng (Hons) Mechatronics Engineering' },
    { label: 'University', value: 'University of Canterbury' },
    { label: 'Honours', value: 'First Class Honours' },
    {
      label: 'Focus Areas',
      value: 'Embedded Systems, Robotics, Computer Vision',
    },
  ],
  interests: [
    'Embedded Systems',
    'Robotics',
    'Computer Vision',
    'Programming',
    'Electrical Design',
    'Web Development',
    'Machine Learning',
    'Data Science',
  ],
  projects: [
    {
      slug: 'ur5-robot-programming',
      title: 'UR5 Robot Programming',
      institution: 'University of Canterbury',
      languages: ['Python', 'RoboDK'],
      summary:
        'Programmed a UR5 robotic arm to perform barista-style tasks using transformation matrices, path planning, and computer-vision-driven handwriting.',
      detail: [
        'This project involved programming a UR5 robotic arm to perform a certain number of tasks a barista might perform when making a cup of coffee. We were given measurements of the environment and had to create transformation matrices for each tool and/or machine that the arm interacted with. This involved a great deal of vector mathematics and analysis.',
        'In addition to the mathematics, another avenue that needed to be explored was path planning and consideration to perform all the tasks as fast and as smooth as possible, i.e. without any unnecessary movements. As an extra to the project, we were asked to attempt to get the robot to sign or write a custom phrase with a ballpoint pen. This involved deriving the inverse Jacobian, which is comprised of the linear and rotation information of each joint with respect to the base joint, and using this to directly move the pen on the page.',
        'While this was complex enough, my partner and I took it one step further and used computer vision to take a word drawn directly from a tablet and obtain coordinates for the arm from the letters. All of this was done through OOP Python and using some of the RoboDK API functions and objects.',
      ],
      images: [
        `${LEGACY_IMG}/frame_assignment_example.png`,
        `${LEGACY_IMG}/ur5_resolved_motion.png`,
      ],
      tags: ['Python', 'RoboDK', 'Computer Vision', 'Kinematics'],
    },
    {
      slug: 'rc-helicopter-pid',
      title: 'RC Helicopter PID Control System',
      institution: 'University of Canterbury',
      languages: ['C/C++'],
      summary:
        'Designed a 2-DOF (yaw and altitude) PID control system for a real RC helicopter on a TIVA board, with quadrature yaw decoding and a UART OLED display.',
      detail: [
        "This project incorporated control system design, programming, and some real world considerations because it actually controlled a real helicopter. The project was simplified in that the helicopter's movement was constrained to 2 DOF, yaw and altitude. Despite this, it still presented some challenges in creating pin-point movements within these degrees of freedom. It required control system design considerations due to the main rotor having contributions on the yaw, because of conservation of angular momentum, so the tail rotor needed to continually compensate for this despite no inputs for turning.",
        'We were using a TIVA board, with a TI microchip, and this interfaced with the helicopter via PWM signals to the tail and main rotor. In addition to the real world controls of the helicopter, a UART OLED display needed to be updated with relevant information of PWM duty cycle of the rotors and the real altitude and yaw of the helicopter via interpreting analogue signals.',
        'In order to control the helicopter and maintain a consistent update and processing of the signals a time scheduler was needed, as well as interrupts due to how yaw was calculated. In order to get an accurate value of yaw, a quadrature signal of PWM needed to be interpreted and a magnitude and direction could be derived from this when combined with a calibration input. The state machine that was used as a means to control the helicopter is shown in the image below.',
      ],
      images: [`${LEGACY_IMG}/helicopter_state_machine.png`],
      tags: ['C/C++', 'PID Control', 'Embedded', 'TIVA'],
    },
    {
      slug: 'rc-helicopter-emulator',
      title: 'RC Helicopter Emulator',
      institution: 'University of Canterbury',
      languages: ['C/C++', 'Simulink'],
      summary:
        'Built a real-time emulator of the RC helicopter using a Simulink-generated model, FreeRTOS, quadrature yaw output and a 12-bit DAC, including a custom joining PCB.',
      detail: [
        'This project was very similar to the RC helicopter control system, in that my part of the project was to emulate the entire helicopter and how it would behave under the same conditions, and give the same outputs to the controller. Additionally the emulator had to respond fast enough to inputs and produce outputs such that it could adequately be controlled by a control system using a FreeRTOS.',
        'The emulator had a basic time scheduler with an interrupt service routine to handle the outputs of quadrature encoded yaw, and used a DAC to emulate the changes in altitude to the controller. The heart of the emulator was the Simulink Model, which was created using a block diagram in Simulink and then generating very non-readable code that would give a model height or model yaw when provided with the inputs of the controller.',
        'The yaw was quadrature encoded using two signals which were essentially PWM signals but with constantly changing duty cycles. The altitude was emulated using a 12-bit DAC, providing an analogue signal similar to how the real helicopter did. There was also an additional aspect of this project: the helicopter had to be able to be emulated in multiple gravitational fields, so the model had to take this into account when generating the height from the given PWM of the tail and main rotor.',
        'One notable endeavour for this project was that, given the controller and emulator were on separate PCBs, we created a PCB to join them to streamline the otherwise troublesome connections between the boards and the DAC. This also provided an opportunity to create a joystick that could be used to control the helicopter rather than buttons.',
      ],
      images: [
        `${LEGACY_IMG}/helirig_emulator_model.png`,
        `${LEGACY_IMG}/Emulator_Block_diagram.png`,
      ],
      tags: ['C/C++', 'FreeRTOS', 'Simulink', 'DAC'],
    },
    {
      slug: 'automatic-dartboard-scoring',
      title: 'Automatic Dartboard Scoring',
      institution: 'University of Canterbury',
      languages: ['Python', 'OpenCV'],
      summary:
        'A computer-vision system using OpenCV to automatically score dart throws via segmentation and edge detection, reaching 74% accuracy.',
      detail: [
        'For a project in a computer vision course, we were asked to come up with an idea on our own to program and implement. My idea was to use solely OpenCV as a means to score a dart throw on a dartboard automatically. This project involved a great deal of segmentation, edge detection, and even vector mathematics.',
        "The basis for this project was a cheap and inexpensive way to score darts, but for it to also be viable. Throughout this project I learned many of the mechanics behind image processing and the ability to use OpenCV to manipulate images from a static camera to isolate scoring regions and determine a dart's score based on the region and multiplier. The project was far from perfect, but at the end I found that this was a viable method to find the score of the dart to an accuracy of 74%.",
      ],
      images: [`${LEGACY_IMG}/auto_dartboard_1.png`, `${LEGACY_IMG}/auto_dartboard_2.png`],
      tags: ['Python', 'OpenCV', 'Computer Vision'],
    },
    {
      slug: 'wacky-racers-pcb',
      title: 'Wacky Racers PCB',
      institution: 'University of Canterbury',
      languages: ['C/C++', 'Altium'],
      summary:
        'Designed and built two PCBs from scratch in Altium with wireless communication, programming a tank "racer" with PWM motor control and a servo turret.',
      detail: [
        'This project involved the interaction between 2 Printed Circuit Boards (PCBs) via wireless communication that were designed and built from scratch, and subsequently programmed in C/C++. The drivers used for the hardware interfacing were written for us in order to simplify the project. The main takeaway from the project was the thought process and planning that goes into designing a PCB from scratch.',
        'We were only given the chance to make one board, so mistakes that were made with routing or any considerations we did not make before submitting were punished with a board mod or a reduction in the final mark. The board was routed in Altium, and the microchip was programmed using CCS.',
        'The board my partner and I designed was for the "racer", which would receive PWM duty cycles wirelessly from the "hat" and the motors were powered accordingly via PWM signals. Additionally, since the racer we designed was a tank, we had programmed in a servo routine for the turret to move around when it received the right input from the "hat" control.',
      ],
      images: [`${LEGACY_IMG}/wacky_racer_pcb.png`, `${LEGACY_IMG}/wacky_racer_and_hat.png`],
      tags: ['C/C++', 'Altium', 'PCB', 'Wireless'],
    },
    {
      slug: 'algorithm-optimization',
      title: 'Algorithm Optimization',
      institution: 'University of Canterbury',
      languages: ['C++'],
      summary:
        'Optimized a discretised Poisson-equation Jacobi relaxation solver by exploiting CPU caching, dramatically reducing runtime over 500 iterations.',
      detail: [
        'The goal of this project was to break down how a computer actually handles large amounts of similar operations which exponentially increased, and optimize the operations with time-saving and efficient techniques. The operations involved using a discretised version of the Poisson Equation in order to determine the changes in electric potential for a flattened 3D array, over 500 iterations. This is called a Jacobi relaxation algorithm.',
        'Throughout this project I learned about the deeper inner workings of the CPU and the layers of caching within them. To have the best success with this project, one had to explore each line of code and analyse what is actually happening on the base level in order to understand what could be adjusted or changed to receive the same end product but dramatically faster processing.',
        'The graph below shows how the completion time changes for each method. The number of iterations is 500 but the size of the array could only be 501 by 501 by 501 due to time constraints imposed by the slower methods.',
      ],
      images: [`${LEGACY_IMG}/Opt_Method_vs_Time_501_Smaller_v2.png`],
      tags: ['C++', 'Optimization', 'HPC'],
    },
    {
      slug: 'turtlebot-navigation',
      title: 'Turtle Bot Path Planning & Navigation',
      institution: 'University of Canterbury',
      languages: ['Python'],
      summary:
        'Implemented a particle filter combining motion and sensor models for robot localization and mapping, with a kidnapped-robot recovery fail-safe.',
      detail: [
        "A robot's ability to navigate its surroundings is extremely important, and it's something we take for granted because we have already evolved as a species to have a good sense of direction and to take note of landmarks to keep track of where we have been. This project's goal was to design a motion and sensor model to enable a robot to localise its position and map out where it has been, given odometry and sensor data.",
        "By the end of the project I had developed a deeper understanding of motion models, sensor models and combining these to more accurately judge a robot's path. The motion model acts as a dead reckoning for where the robot has been, but it is fairly inaccurate over time due to external factors like slip. The sensor model, by itself, is also somewhat inaccurate due to occasional unexpected data readings. When combined using a particle filter, these datasets worked nicely to keep track of the robot and also to correct the path of the robot when unexpected results begin to drive the estimation.",
        "Additionally, the filter and mapping design had a fail-safe installed for when the robot was totally lost. To test this, the robot's starting position, which had otherwise been known, was now made unknown. The robot would increase the number of particles in its particle filter, requiring more computational speed, and also spread out the particles via a uniform distribution and then by using sensor measurements determine its approximate location by weighing the particles accordingly. Below is a map generated by a particle filter, overlaid on the dead reckoning (based solely on odometry) and SLAM (Simultaneous Location and Mapping), used as the best guess for where the robot has actually been.",
      ],
      images: [`${LEGACY_IMG}/turtlebot_nav_map.png`],
      tags: ['Python', 'Particle Filter', 'SLAM', 'Robotics'],
    },
    {
      slug: 'edge-detection-wavelets',
      title: 'Edge Detection with Wavelet Transforms',
      institution: 'University of Canterbury',
      languages: ['Python'],
      summary:
        'Built a PyWavelets GUI that uses wavelet transforms to decompose images by frequency and direction and detect edges via level thresholding.',
      detail: [
        'The prompt for this project was to come up with an idea that used wavelet transforms for the purpose of signal feature detection. The idea that we came up with was using wavelet transforms in order to detect the edges in an image. Wavelet transforms allow signals to be represented as a sum of scaled and shifted versions of a wavelet function or "Mother" wavelet and a related scaling function. Wavelets themselves are wave-like oscillations that have a zero mean and a non-zero power, and they can be expressed as continuous or discrete representations.',
        'This project involved using a Python library "PyWavelets" and creating a GUI that we used to take images and manipulate them with wavelets and isolate the edges of the images. A few screenshots of the GUI can be seen below. The first image shows the levels of the image that the wavelet transform isolates based on the high and low frequencies of the image, and the direction of the detail. The second image showcases the potential of the wavelet transforms to then use these levels to detect the edges present in the image, by constraining the levels used in the reconstructed image and then also thresholding them.',
      ],
      images: [`${LEGACY_IMG}/levels_yielded_by_WT.png`, `${LEGACY_IMG}/edge_detection_GUI.png`],
      tags: ['Python', 'PyWavelets', 'Signal Processing'],
    },
    {
      slug: 'fpga-timer-pwm',
      title: 'FPGA Programmable Timer & PWM Generator',
      institution: 'University of Canterbury',
      languages: ['VHDL', 'Vivado'],
      summary:
        'Developed a user-programmable timer and PWM generator on an FPGA in VHDL, using a state machine and hardware logic (LUTs, flip-flops).',
      detail: [
        'This project was one of the more unique projects I have taken part in, as it involved a hardware description language and utilized an FPGA. The project involved developing a user-programmable timer and PWM wave generator. We made a state machine to cycle between a timer, a PWM generator, and the settings of each (e.g. duty cycle, clock speed, assert high/low etc).',
        'It was a very interesting experience learning how FPGAs are different to normal MCU programming as it actually creates the logic in the hardware with LUTs, flip-flops and combinatory logic. To see how we designed the program, there is a block diagram available below.',
      ],
      images: [`${LEGACY_IMG}/block_diagram_FPGA_PWM.png`],
      tags: ['VHDL', 'Vivado', 'FPGA'],
    },
  ],
  contactLinks: [
    {
      label: 'Email',
      value: 'nicholask.12210@gmail.com',
      href: 'mailto:nicholask.12210@gmail.com',
      icon: 'email',
    },
    {
      label: 'Phone',
      value: '+1 (720) 957-6837',
      href: 'tel:+17209576837',
      icon: 'phone',
    },
    {
      label: 'GitHub',
      value: 'github.com/nicholas-krause',
      href: 'https://github.com/nicholas-krause/',
      icon: 'github',
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/nicholas-krause',
      href: 'https://www.linkedin.com/in/nicholas-krause-656526151',
      icon: 'linkedin',
    },
  ],
  cv: {
    filename: 'CV-Nicholas-Krause.pdf',
    path: 'assets/cv/CV-Nicholas-Krause.pdf',
    updatedLabel: 'CV (updated 2025)',
  },
  legacy: {
    bundledPath: 'assets/legacy/index.html',
    fallbackUrl: 'https://nicholaslkrause.com/',
  },
};

export const NAV_SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Resume' },
  { id: 'interests', label: 'Interests' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const;
