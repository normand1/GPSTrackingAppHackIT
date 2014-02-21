//
//  VIGDeviceRegistrationViewController.h
//  CiscoVigil
//
//  Created by davinorm on 2/21/14.
//  Copyright (c) 2014 David Norman. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Parse/Parse.h>

@interface VIGDeviceRegistrationViewController : UIViewController <UIPickerViewDataSource, UIPickerViewDelegate, PFLogInViewControllerDelegate, PFSignUpViewControllerDelegate>


@property (strong, nonatomic) IBOutlet UIPickerView *picker;
@property (strong, nonatomic) NSArray *deviceNamesArray;
@property (strong, nonatomic) NSArray *exchangeRates;



@end
