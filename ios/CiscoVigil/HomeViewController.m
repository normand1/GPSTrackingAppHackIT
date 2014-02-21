//
//  HomeViewController.m
//  Geolocations
//
//  Created by davinorm on 2/20/14.
//  Copyright (c) 2014 Parse, Inc. All rights reserved.
//

#import "HomeViewController.h"
#import <CoreLocation/CoreLocation.h>
#import <Parse/Parse.h>
#import <MapKit/MapKit.h>


@interface HomeViewController ()

@end

@implementation HomeViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view.
    
    self.ciscoLogoImage.animationImages = [NSArray arrayWithObjects:
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black1.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black2.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black3.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black4.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black5.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black6.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black7.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black8.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black9.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black8.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black7.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black6.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black5.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black4.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black3.png"],
                                  [UIImage imageNamed:@"Cisco_Logo_RGB_Screen_Black2.png"],
                                  nil];
    
    // How many seconds it should take to go through all images one time.
    self.ciscoLogoImage.animationDuration = 1;
    
    // How many times to repeat the animation (0 for indefinitely).
    self.ciscoLogoImage.animationRepeatCount = 0;
    
    [self.ciscoLogoImage startAnimating];
    
    _lm = [[CLLocationManager alloc] init];
    _lm.delegate = self;
    _lm.desiredAccuracy = kCLLocationAccuracyBest;
    _lm.distanceFilter = kCLDistanceFilterNone;
    [_lm startUpdatingLocation];
    
    CLLocation *location = [_lm location];
    
    CLLocationCoordinate2D coord;
    coord.latitude = location.coordinate.latitude;
    coord.longitude = location.coordinate.longitude;
    NSLog(@"lat: %f", coord.latitude);
    NSLog(@"long: %f", coord.longitude);
    
    NSString *latStr = [NSString stringWithFormat:@"Lat: %f", coord.latitude];
    NSString *lonStr = [NSString stringWithFormat:@"Long: %f", coord.longitude];
    
    self.latLabel.text = latStr;
    self.longLabel.text = lonStr;

    NSRunLoop *runloop = [NSRunLoop currentRunLoop];
    NSTimer *timer = [NSTimer timerWithTimeInterval:1 target:self selector:@selector(updateLocation) userInfo:nil repeats:YES];
    [runloop addTimer:timer forMode:NSRunLoopCommonModes];
    [runloop addTimer:timer forMode:UITrackingRunLoopMode];
    
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}



-(void)updateLocation
{
    _lm = [[CLLocationManager alloc] init];
    _lm.delegate = self;
    _lm.desiredAccuracy = kCLLocationAccuracyBest;
    _lm.distanceFilter = kCLDistanceFilterNone;
    [_lm startUpdatingLocation];
    
    CLLocation *location = [_lm location];
    
    CLLocationCoordinate2D coord;
    coord.latitude = location.coordinate.latitude;
    coord.longitude = location.coordinate.longitude;
    NSString *currentUserObjId = [[PFUser currentUser] objectId];
//    NSLog(@"[[PFUser currentUser] objectId] : %@", [[PFUser currentUser] objectId]);
//    NSLog(@"lat: %f", coord.latitude);
//    NSLog(@"long: %f", coord.longitude);
//    
    NSString *latStr = [NSString stringWithFormat:@"Lat: %f", coord.latitude];
    NSString *lonStr = [NSString stringWithFormat:@"Long: %f", coord.longitude];
    
    self.latLabel.text = latStr;
    self.longLabel.text = lonStr;

}

- (IBAction)ExecutePing:(id)sender {
    
    _lm = [[CLLocationManager alloc] init];
    _lm.delegate = self;
    _lm.desiredAccuracy = kCLLocationAccuracyBest;
    _lm.distanceFilter = kCLDistanceFilterNone;
    [_lm startUpdatingLocation];
    
    CLLocation *location = [_lm location];
    
    CLLocationCoordinate2D coord;
    coord.latitude = location.coordinate.latitude;
    coord.longitude = location.coordinate.longitude;
    NSString *currentUserObjId = [[PFUser currentUser] objectId];
    NSLog(@"[[PFUser currentUser] objectId] : %@", [[PFUser currentUser] objectId]);
    NSLog(@"lat: %f", coord.latitude);
    NSLog(@"long: %f", coord.longitude);
    
    NSString *latStr = [NSString stringWithFormat:@"%f", coord.latitude];
    NSString *lonStr = [NSString stringWithFormat:@"%f", coord.longitude];
    NSDictionary *params = @{@"userId": currentUserObjId, @"latitude" : latStr , @"longitude" : lonStr};
//    NSDictionary *params = @{@"userId": currentUserObjId, @"latitude" : @"27.412161" , @"longitude" : @"50.954888"};
    
    [PFCloud callFunctionInBackground:@"Ping"
                       withParameters:params block:^(NSArray *results, NSError *error) {
                           if (!error) {
                               // this is where you handle the results and change the UI.
                               NSLog(@"error: %@", error);
                               NSLog(@"results: %@", results);
//                               if (results[0]) {
//                                   PFUser *thisUser = [PFUser currentUser];
//                                   thisUser[@"outOfBounds"] = @YES;
//                                   [thisUser saveEventually:^(BOOL succeeded, NSError *error) {
//                                       if (succeeded) {
//                                           NSLog(@"succeeded");
//                                           
//                                       }
//                                       else
//                                       {
//                                           NSLog(@"failed with error: %@", error);
//                                       }
//                                   }];
//                               }
                           }
                           NSLog(@"error: %@", error);
                           PFUser *thisUser = [PFUser currentUser];
                           thisUser[@"outOfBounds"] = @YES;
                           [thisUser saveEventually:^(BOOL succeeded, NSError *error) {
                               if (succeeded) {
                                   NSLog(@"succeeded");
                                   
                               }
                               else
                               {
                                   NSLog(@"failed with error: %@", error);
                               }
                           }];
                       }];
}


- (IBAction)defineRegionButton:(id)sender {
    
    
}

- (void)registerRegionWithCircularOverlay:(MKCircle*)overlay andIdentifier:(NSString*)identifier {
    
    _lm = [[CLLocationManager alloc] init];

    
    // If the overlay's radius is too large, registration fails automatically,
    // so clamp the radius to the max value.
    CLLocationDegrees radius = overlay.radius;
    if (radius > _lm.maximumRegionMonitoringDistance) {
        radius = _lm.maximumRegionMonitoringDistance;
    }
    
    // Create the geographic region to be monitored.
    CLCircularRegion *geoRegion = [[CLCircularRegion alloc]
                                   initWithCenter:overlay.coordinate
                                   radius:radius
                                   identifier:identifier];
    [_lm startMonitoringForRegion:geoRegion];
}








@end
