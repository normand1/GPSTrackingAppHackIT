//
//  HomeViewController.h
//  Geolocations
//
//  Created by davinorm on 2/20/14.
//  Copyright (c) 2014 Parse, Inc. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Parse/Parse.h>
#import <CoreLocation/CoreLocation.h>
#import <CoreLocation/CoreLocation.h>


@interface HomeViewController : UIViewController <CLLocationManagerDelegate>

@property (nonatomic, strong) PFObject *detailItem;
@property (nonatomic, strong) CLLocationManager *lm;

@property (weak, nonatomic) IBOutlet UIImageView *ciscoLogoImage;

@property (weak, nonatomic) IBOutlet UILabel *latLabel;
@property (weak, nonatomic) IBOutlet UILabel *longLabel;

@end
