//
//  VIGServiceSelectionViewController.h
//  CiscoVigil
//
//  Created by davinorm on 2/21/14.
//  Copyright (c) 2014 David Norman. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface VIGServiceSelectionViewController : UIViewController <UIPickerViewDelegate, UIPickerViewDataSource>

@property (nonatomic, strong) NSArray *serviceArray;
@property (strong, nonatomic) IBOutlet UIPickerView *picker;

@end
