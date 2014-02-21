//
//  SettingsViewController.h
//  Geolocations
//
//  Created by davinorm on 2/20/14.
//  Copyright (c) 2014 Parse, Inc. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Parse/Parse.h>


@interface SettingsViewController : UIViewController


@property (weak, nonatomic) IBOutlet UITextField *phoneNumberTextField;

@property (weak, nonatomic) IBOutlet UIButton *saveSettingsButton;

@property (nonatomic, strong) PFUser *userObject;



@end
