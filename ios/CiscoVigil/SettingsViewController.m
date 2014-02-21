//
//  SettingsViewController.m
//  Geolocations
//
//  Created by davinorm on 2/20/14.
//  Copyright (c) 2014 Parse, Inc. All rights reserved.
//

#import "SettingsViewController.h"

@interface SettingsViewController ()

@end

@implementation SettingsViewController

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
    self.userObject = [[PFUser alloc]init];
    self.userObject = [PFUser currentUser];
    NSLog([[PFUser currentUser] objectForKey:@"username"]);
    NSLog([self.userObject objectForKey:@"username"]);
    

    
    
}

- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event
{
    [self.view endEditing:YES];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)phoneNumberEditingDidEnd:(UITextField *)sender {
    [self.userObject setObject:sender.text forKey:@"phonenumber"];
    [self.userObject saveEventually:^(BOOL succeeded, NSError *error) {
        NSLog(@"saved the new phone number");
    }];
}


- (IBAction)saveSettingsTouched:(id)sender {
    
    
}


@end
